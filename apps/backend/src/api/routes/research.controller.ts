import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Res,
  Headers,
} from '@nestjs/common';
import { ResearchAgentService } from '@gitroom/nestjs-libraries/agent/research.agent.service';
import { JwtAuthGuard } from '@gitroom/nestjs-libraries/auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('research')
@Controller('research')
export class ResearchController {
  constructor(private readonly researchService: ResearchAgentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Generate research on a topic' })
  @ApiResponse({
    status: 200,
    description: 'Research generated successfully',
  })
  async generateResearch(@Body() body: { query: string }) {
    try {
      const iterator = this.researchService.start(body.query);
      let finalResult = null;
      
      for await (const step of iterator) {
        if (step.name === 'final') {
          finalResult = step.data.output;
        }
      }
      
      return {
        success: true,
        data: {
          summary: finalResult?.summary || 'No research results available',
          search_results: finalResult?.search_results || []
        }
      };
    } catch (error) {
      console.error('Error generating research:', error);
      return {
        success: false,
        error: 'Failed to generate research',
        details: error.message
      };
    }
  }
} 