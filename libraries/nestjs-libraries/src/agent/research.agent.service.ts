import { Injectable } from '@nestjs/common';
import {
  BaseMessage,
  HumanMessage,
  ToolMessage,
} from '@langchain/core/messages';
import { END, START, StateGraph } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

const tools = !process.env.TAVILY_API_KEY ? [] : [new TavilySearchResults({ maxResults: 3 })];
const toolNode = new ToolNode(tools);

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-proj-',
  model: 'gpt-4o-2024-08-06',
  temperature: 0.7,
});

interface ResearchWorkflowState {
  messages: BaseMessage[];
  question: string;
  search_results?: string;
  summary?: string;
}

// Schema for the research report
const researchReport = z.object({
  report: z.string().describe('Comprehensive research report based on the provided search results')
});

@Injectable()
export class ResearchAgentService {
  constructor() {}
  
  static state = () =>
    new StateGraph<ResearchWorkflowState>({
      channels: {
        messages: {
          reducer: (currentState, updateValue) =>
            currentState.concat(updateValue),
          default: () => [],
        },
        question: null,
        search_results: null,
        summary: null,
      },
    });

  async startResearch(state: ResearchWorkflowState) {
    const runTools = model.bindTools(tools);
    const response = await ChatPromptTemplate.fromTemplate(
      `
      You are a research assistant that helps users find information on any topic.
      First, understand the user's research request and perform a web search to gather relevant information.
      Conduct thorough research on the following topic:
      {text}
      `
    )
      .pipe(runTools)
      .invoke({
        text: state.messages[state.messages.length - 1].content,
      });

    return { messages: [response] };
  }

  async saveSearchResults(state: ResearchWorkflowState) {
    const searchContent = state.messages
      .filter((f) => f instanceof ToolMessage)
      .map(m => m.content)
      .join('\n\n');
    return { search_results: searchContent };
  }

  async generateReport(state: ResearchWorkflowState) {
    const structuredOutput = model.withStructuredOutput(researchReport);
    const { report } = await ChatPromptTemplate.fromTemplate(
      `
      You are a research assistant tasked with creating a comprehensive, well-structured report based on the search results provided.
      
      ## Guidelines:
      - Write in a clear, objective, and professional tone
      - Organize information logically with appropriate headings and subheadings
      - Cite sources where appropriate
      - Focus on factual information and avoid personal opinions
      - Synthesize information from multiple sources when available
      - Include relevant statistics, examples, and expert opinions when available
      
      ## Original Research Question:
      {question}
      
      ## Search Results:
      {search_results}
      
      Based on these search results, write a comprehensive research report that thoroughly answers the original question.
      `
    )
      .pipe(structuredOutput)
      .invoke({
        question: state.question,
        search_results: state.search_results,
      });

    return { summary: report };
  }

  async *start(query: string) {
    // Initialize state
    const workflow = ResearchAgentService.state();

    // Define the edges of the workflow
    workflow.addEdge(START, this.startResearch.name);
    workflow.addEdge(this.startResearch.name, this.saveSearchResults.name);
    workflow.addEdge(this.saveSearchResults.name, this.generateReport.name);
    workflow.addEdge(this.generateReport.name, END);

    // Add nodes
    workflow.addNode(this.startResearch.name, this.startResearch.bind(this));
    workflow.addNode(this.saveSearchResults.name, this.saveSearchResults.bind(this));
    workflow.addNode(this.generateReport.name, this.generateReport.bind(this));

    // Create a human message
    const message = new HumanMessage(query);

    // Run the graph
    const inputs = {
      messages: [message],
      question: query,
    };

    const compiler = workflow.compile();
    const steps = compiler.stream(inputs);

    for await (const step of steps) {
      const name = step.step?.name;
      // Skip null steps
      if (!name) {
        continue;
      }

      // Only yield named steps for better tracing
      yield {
        name,
        data: step.state,
      };
    }

    // Get the final response
    const finalState = steps[Symbol.asyncIterator]().next();
    const finalOutput = (await finalState).value?.state;

    yield {
      name: 'final',
      data: {
        output: finalOutput
      }
    };
  }
} 