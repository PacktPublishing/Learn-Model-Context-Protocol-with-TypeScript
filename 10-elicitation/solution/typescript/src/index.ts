import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import express from "express";

// Create an MCP server
const server = new McpServer({
  name: "Demo",
  version: "1.0.0"
},
{
  "capabilities": {
    "elicitation": {}
  }
});

function checkAvailability(date: string): Promise<boolean> {
    // Simulate checking availability
    return Promise.resolve(date === "2025-01-01");
}

 server.tool(
  "book-trip",
  { 
    date: z.string(),
    memberId: z.string().optional()
  },
  async ({ date, memberId }) => {
    // 1. Check if user wants to be a member
    
    if (!memberId) {
      // 2. Elicitation for membership info
      const result = await server.server.elicitInput({
        message: `Would you like to be a member?`,
        requestedSchema: {
          type: "object",
          properties: {
            submitInformation: {
              type: "boolean",
              title: "Submit member information?",
              description: "Fill in name and email"
            },
            name: {
              type: "string",
              title: "Name",
              description: "Please provide your name"
            },
            email: {
              type: "string",
              title: "Email",
              description: "Please provide your email"
            }
          },
          required: ["submitInformation"]
        }
      });

      // 3. Check if user said yes to submit information for membership
      if (result.action === "accept" && result.content?.submitInformation) {
        let name = result.content?.name;
        let email = result.content?.email;

        if(name && email) {
          return {
            content: [
              {
                type: "text",
                text: `Trip booked on date: ${date}, welcome ${name} as member!`
              }
            ]
          };
        } else {
          // 3b. No member information provided
          return {
            content: [
              {
                type: "text",
                text: `Trip booked on date: ${date}.`
              }
            ]
          };
        }  
      }
      // 4. User didn't provide member info so not signed up
      return {
        content: [{
          type: "text",
          text: "Trip booked on date: ${date}"
        }]
      };
    } else {
    // 1b. available, confirm booking, existing member
      return {
        content: [{
          type: "text",
          text: `Trip booked on date: ${date}, for ${memberId}`
        }]
      };
  }
  }
);

const app = express();
app.use(express.json());

// Store transports for each session type
const transports = {
  sse: {} as Record<string, SSEServerTransport>
};

app.get('/sse', async (req, res) => {
  // Create SSE transport for legacy clients
  const transport = new SSEServerTransport('/messages', res);
  transports.sse[transport.sessionId] = transport;
  
  res.on("close", () => {
    delete transports.sse[transport.sessionId];
  });
  
  await server.connect(transport);
});

// Legacy message endpoint for older clients
app.post('/messages', async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const transport = transports.sse[sessionId];
  if (transport) {
    await transport.handlePostMessage(req, res, req.body);
  } else {
    res.status(400).send('No transport found for sessionId');
  }
});

app.listen(4000);
