Introduction
Build autonomous multi-agent systems with Agent Teams
Reliability is one of the biggest challenges in building agentic systems, for this reason, we recommend that Agents have a narrow scope and a small number of tools.

However, real-world problems often span multiple domains and require diverse skill sets, meaning that a single agent is not able to solve the problem reliably.

Agent Teams combine multiple specialized agents, each focused on a different aspect of the problem, to solve complex problems in an autonomous manner.

​
What are Agent Teams?

Agent Teams are a collection of Agents (or other sub-teams) that work together to accomplish tasks. Agent Teams can either “coordinate”, “collaborate” or “route” to solve a task.

Route Mode: The Team Leader routes the user’s request to the most appropriate team member based on the content of the request.
Coordinate Mode: The Team Leader delegates tasks to team members and synthesizes their outputs into a cohesive response.
Collaborate Mode: All team members are given the same task and the team coordinator synthesizes their outputs into a cohesive response.
​
Example

Let’s walk through a simple example where we use different models to answer questions in different languages. The team consists of three specialized agents and the team leader routes the user’s question to the appropriate language agent.

multilanguage_team.py

Copy
from agno.agent import Agent
from agno.models.deepseek import DeepSeek
from agno.models.mistral.mistral import MistralChat
from agno.models.openai import OpenAIChat
from agno.team.team import Team

english_agent = Agent(
    name="English Agent",
    role="You only answer in English",
    model=OpenAIChat(id="gpt-4o"),
)
chinese_agent = Agent(
    name="Chinese Agent",
    role="You only answer in Chinese",
    model=DeepSeek(id="deepseek-chat"),
)
french_agent = Agent(
    name="French Agent",
    role="You can only answer in French",
    model=MistralChat(id="mistral-large-latest"),
)

multi_language_team = Team(
    name="Multi Language Team",
    mode="route",
    model=OpenAIChat("gpt-4o"),
    members=[english_agent, chinese_agent, french_agent],
    show_tool_calls=True,
    markdown=True,
    description="You are a language router that directs questions to the appropriate language agent.",
    instructions=[
        "Identify the language of the user's question and direct it to the appropriate language agent.",
        "If the user asks in a language whose agent is not a team member, respond in English with:",
        "'I can only answer in the following languages: English, Chinese, French. Please ask your question in one of these languages.'",
        "Always check the language of the user's input before routing to an agent.",
        "For unsupported languages like Italian, respond in English with the above message.",
    ],
    show_members_responses=True,
)


if __name__ == "__main__":
    # Ask "How are you?" in all supported languages
    multi_language_team.print_response("Comment allez-vous?", stream=True)  # French
    multi_language_team.print_response("How are you?", stream=True)  # English
    multi_language_team.print_response("你好吗？", stream=True)  # Chinese
    multi_language_team.print_response("Come stai?", stream=True)  # Italian
​
Team Context

Agent Teams maintain a shared context that is updated agentically (i.e. by the team leader) and is sent to team members if needed.

Agentic Context is critical for effective information sharing and collaboration between agents and the quality of the team’s responses depends on how well the team leader manages the shared context. This means we should use better models for the team leader to ensure the quality of the team’s responses.

The tasks and responses of team members are automatically added to the team context, but Agentic Context needs to be enabled by the developer.
​
Enable Agentic Context

To enable the Team leader to maintain Agentic Context, set enable_agentic_context=True.

This will allow the team leader to maintain and update the team context during the run.


Copy
team = Team(
    members=[agent1, agent2, agent3],
    enable_agentic_context=True,  # Enable Team Leader to maintain Agentic Context
)
​
Team Member Interactions

Agent Teams can share interactions between members, allowing agents to learn from each other’s outputs:


Copy
team = Team(
    members=[agent1, agent2, agent3],
    share_member_interactions=True,  # Share interactions
)
Member interactions are automatically added to the team context after communication with members
​
Team Memory and History

Teams can maintain memory of previous interactions, enabling contextual awareness:


Copy
from agno.team import Team

team_with_memory = Team(
    name="Team with Memory",
    members=[agent1, agent2],
    enable_team_history=True,
    num_of_interactions_from_history=5,
)

# The team will remember previous interactions
team_with_memory.print_response("What are the key challenges in quantum computing?")
team_with_memory.print_response("Elaborate on the second challenge you mentioned")
​
Running Teams

Teams support both synchronous and asynchronous execution, with optional streaming:


Copy
# Synchronous execution
result = team.run("Create an analysis of recent AI developments")

# Asynchronous execution
result = await team.arun("Create an analysis of recent AI developments")

# Streaming responses
for chunk in team.run("Create an analysis of recent AI developments", stream=True):
    print(chunk.content, end="", flush=True)

# Asynchronous streaming
async for chunk in await team.arun("Create an analysis of recent AI developments", stream=True):
    print(chunk.content, end="", flush=True)
​
Examples

​
Content Team

Let’s walk through another example where we use two specialized agents to write a blog post. The team leader coordinates the agents to write a blog post.

content_team.py

Copy
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.team import Team
from agno.tools.duckduckgo import DuckDuckGoTools

# Create individual specialized agents
researcher = Agent(
    name="Researcher",
    role="Expert at finding information",
    tools=[DuckDuckGoTools()],
    model=OpenAIChat("gpt-4o"),
)

writer = Agent(
    name="Writer",
    role="Expert at writing clear, engaging content",
    model=OpenAIChat("gpt-4o"),
)

# Create a team with these agents
content_team = Team(
    name="Content Team",
    mode="coordinate",
    members=[researcher, writer],
    instructions="You are a team of researchers and writers that work together to create high-quality content.",
    model=OpenAIChat("gpt-4o"),
    markdown=True,
)

# Run the team with a task
content_team.print_response("Create a short article about quantum computing")
​
Research Team

Here’s an example of a research team that combines multiple specialized agents:

1
Create HackerNews Team

Create a file hackernews_team.py

hackernews_team.py

Copy
from typing import List

from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.team import Team
from agno.tools.duckduckgo import DuckDuckGoTools
from agno.tools.hackernews import HackerNewsTools
from agno.tools.newspaper4k import Newspaper4kTools
from pydantic import BaseModel

class Article(BaseModel):
    title: str
    summary: str
    reference_links: List[str]


hn_researcher = Agent(
    name="HackerNews Researcher",
    model=OpenAIChat("gpt-4o"),
    role="Gets top stories from hackernews.",
    tools=[HackerNewsTools()],
)

web_searcher = Agent(
    name="Web Searcher",
    model=OpenAIChat("gpt-4o"),
    role="Searches the web for information on a topic",
    tools=[DuckDuckGoTools()],
    add_datetime_to_instructions=True,
)

article_reader = Agent(
    name="Article Reader",
    role="Reads articles from URLs.",
    tools=[Newspaper4kTools()],
)

hackernews_team = Team(
    name="HackerNews Team",
    mode="coordinate",
    model=OpenAIChat("gpt-4o"),
    members=[hn_researcher, web_searcher, article_reader],
    instructions=[
        "First, search hackernews for what the user is asking about.",
        "Then, ask the article reader to read the links for the stories to get more information.",
        "Important: you must provide the article reader with the links to read.",
        "Then, ask the web searcher to search for each story to get more information.",
        "Finally, provide a thoughtful and engaging summary.",
    ],
    response_model=Article,
    show_tool_calls=True,
    markdown=True,
    debug_mode=True,
    show_members_responses=True,
)

# Run the team
report = hackernews_team.run(
    "What are the top stories on hackernews?"
).content

print(f"Title: {report.title}")
print(f"Summary: {report.summary}")
print(f"Reference Links: {report.reference_links}")
2
Run the team

Install libraries


Copy
pip install openai duckduckgo-search newspaper4k lxml_html_clean agno
Run the team


Copy
python hackernews_team.py
​
