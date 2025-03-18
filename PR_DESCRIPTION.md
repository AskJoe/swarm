# Add OpenAI Research Bot Agent

This PR implements an OpenAI Research Bot Agent as a new feature, available in the dropdown options along with other AI tools like the post generator.

## Changes Made

### Backend
- Created a new `ResearchAgentService` in `libraries/nestjs-libraries/src/agent/research.agent.service.ts`
  - Implements a LangGraph workflow with search capability
  - Generates comprehensive research reports based on user queries
- Registered the service in the `AgentModule`
- Created a new controller endpoint at `/research` for handling research requests
- Added DTO for research requests

### Frontend
- Created a new Research component with:
  - Input form for research queries
  - Loading state indicator
  - Results display area for the research report
- Added the Research component to the UI in the launches component
  - Visible only to users with AI tier enabled, same as the Generator component
- Used the same styling as existing components for consistency

## How It Works
1. User enters a research topic or question
2. The agent performs web search for relevant information
3. The system processes results and generates a comprehensive report
4. Results are displayed to the user in a formatted view

## Testing Instructions
1. Navigate to the main dashboard
2. Click on the "Research Bot" button in the launches section
3. Enter a research topic (at least 10 characters)
4. Click "Research" and wait for results to appear

## Dependencies
This implementation uses existing dependencies already in the project:
- LangChain libraries for the agent workflow
- Tavily search (optional, falls back to simpler implementation if no API key)
- Zod for validation of output 