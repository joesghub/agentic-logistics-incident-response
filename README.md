# agentic-logistics-incident-response
An automated supply chain incident processing system for PepsiCo that analyzes financial impacts of truck breakdowns, makes optimal routing decisions, and coordinates external execution through ServiceNow AI agents and workflow orchestration.



## System Overview 
Description of the automated supply chain incident processing system and its business impact for PepsiCo operations



## Implementation Steps


### Step 1: Application Setup

I created a scoped application in ServiceNow Studio with the exact name: **PepsiCo Deliveries**

*This precise naming will auto-generate the scope: x_snc_pepsico_de_0*
![](https://github.com/joesghub/agentic-logistics-incident-response/blob/main/screenshots/pepsico_deliveries_scoped_application.png?raw=true)


### Step 2: Table Setup

#### Delivery Delay Table

The first table in my system is a Delivery Delay table. It holds the information about the varius truck breakdowns reported from Schneider (Trucking Logistics Provider).

**Delivery Delay Table Fields:**
- `route_id` (Integer, Primary Key)
- `truck_id` (Integer)
- `customer_id` (Integer, Default: 1)
- `problem_description` (String, 4000)
- `proposed_routes` (String, 4000) - JSON format with route options
- `calculated_impact` (String, 4000) - JSON format with financial analysis
- `chosen_option` (String, 4000) - Selected route details
- `status` (String, 16) - Workflow progression: pending/calculated/approved/dispatched
- `assigned_to` (Reference to User) - Critical: Used for trigger execution context and permissions
- `incident_sys_id` (String, 32) - Links to associated incident records

Schneider's Breakdown Notification Agent sends over the data in the required payload structure using ServiceNow's MCP Server and populates our custom table automatically. 

![](https://github.com/joesghub/agentic-logistics-incident-response/blob/main/screenshots/002%20delivery_delay_table.png?raw=true)

![](https://github.com/joesghub/agentic-logistics-incident-response/blob/main/screenshots/002a%20delivery_delay_table_data.png?raw=true)

The `assigned_to` field in Delivery Delay table serves as the execution context for AI agent triggers. This ensures proper permissions and security boundaries when agents process records automatically.

In this system, our Schneider's Breakdown Notification Agent is unable to properly assign the `assigned_to` field due to security permissions. 

However, I used a ServiceNow Workflow to remedy this issue by assigning new records ont he table to System Administrator. 

![](https://github.com/joesghub/agentic-logistics-incident-response/blob/main/screenshots/003%20assigned_to_flow.png?raw=true)

#### Supply Agreement Table

The second table in my system is a Supply Agreement table. It holds the contractual penalties for late shipments from Whole Foods (Retail Client).

![](https://github.com/joesghub/agentic-logistics-incident-response/blob/main/screenshots/004%20supply_agreement_table.png?raw=true)

**Supply Agreement Table Fields:**
- `customer_id` (Integer, Primary Key)
- `customer_name` (String, 100)

- `deliver_window_hours` (Integer) - Contractual delivery timeframe
 
- **`deliver_window_hours`**: The contractual timeframe (in hours) within which deliveries must be completed to avoid penalties. For Whole Foods, deliveries must be completed within 3 hours of departure to avoid charges.
 
- `stockout_penalty_rate` (Integer) - Cost per hour of delay in dollars
  
- **`stockout_penalty_rate`**: The financial penalty (in dollars) assessed for every hour a delivery exceeds the contractual delivery window. Whole Foods charges PepsiCo $250 for each hour beyond the 3-hour delivery window. For example, a 5-hour delivery would incur penalties for 2 hours (5 minus 3), resulting in a $500 penalty charge.

![](https://github.com/joesghub/agentic-logistics-incident-response/blob/main/screenshots/004a%20supply_agreement_table_data.png?raw=true)

### Step 3: Use Case and Trigger Setup

#### Logistics Breakdown Resolution Use Case

I set up my use case to utilize one data point across both agents for a consistent experience. I chose the `route_id` because it is a Primary Key in our Delivery Delay records.  

**Description**
```` 
This use case detects delivery delays, then uses two agents to asses the financial impact and alternative route options.
````

**Instructions (Base Plan)**
````
Use the route id the user enters for both agents. Store the route id in permanently in memory as memory.route_id 

Step 1: Use the Route Financial Analysis Agent with memory.route_id 

Step 2: Use the Route Decision Agent with memory.route_id
````

![](https://github.com/joesghub/agentic-logistics-incident-response/blob/main/screenshots/005%20%20use_case_setup.png?raw=true)

The trigger is configured to run the use case as the assigned user for any created or updated delivery delay records with a Status of `pending`.

![](https://github.com/joesghub/agentic-logistics-incident-response/blob/main/screenshots/006%20use_case_trigger.png?raw=true)

### Step 4: AI Agent Setup

#### Agent 1: Route Financial Analysis Agent

**Role**
````
You analyze delivery delays, calculate the cost of alternate routes, create incident records, and update records with calculated impacts.
````

**Description**
````
Analyze financial impact of delivery disruptions and create incident tracking
````

**Instructions**
````
Step 1: Use the Lookup Delivery Delay Record Tool with the route id the user entered. Retrieve its eta_minutes values for each proposed route.

Step 2: Find the supply agreement record for the customer id on the delivery delay record. Retrieve the fields deliver_window_hours and stockout_penalty_rate. 

Step 3: For each ETA value retrieved from the delivery delay record, call the Calculated Impacts Tool separately.
Do NOT pass an array or comma-separated list of ETA values. 
Instead, call the tool once per ETA (one value at a time). 
After each call, collect the returned values and combine them into a single JSON object that you store in memory as calculated_impact, in the format:
Option 1 - $X.XX
Option 2 - $Y.YY
Option 3 - $Z.ZZ

Step 4: Present the calculated_impact JSON object to the user.

Step 5: Use the Create Incident Tool with the details from the delivery delay record. Store the incident sys_id in memory.

Step 6: Use the route_id to find and update the delivery delay record with the calculated_impact JSON object and incident sys_id.
````

**Proficiency**
````
- The AGENT is proficient in analyzing delivery delays and calculating the financial impact of alternate routes, ensuring that the most cost-effective and timely delivery options are chosen. This involves a deep understanding of logistics and supply chain management.
- The AGENT can effectively use the Lookup Delivery Delay Record Tool to retrieve estimated time of arrival (ETA) values for various routes, enabling the analysis of potential delays and their impacts on delivery schedules.
- The AGENT is capable of using the Calculated Impacts Tool to assess the financial impact of delivery delays, calculating options for cost implications based on ETA values, and compiling these into a comprehensive JSON object for user presentation.
- The AGENT can utilize the Create Incident Tool to generate incident records, capturing essential details such as customer ID, route ID, and problem description, thereby facilitating effective incident management and resolution.
- The AGENT is adept at updating delivery delay records with calculated impacts and incident sys_id, ensuring that all relevant information is accurately recorded and accessible for future reference and decision-making.
````

![](https://github.com/joesghub/agentic-logistics-incident-response/blob/main/screenshots/007%20financial_agent.png?raw=true)

**Route Financial Analysis Agent Tools:**

![](https://github.com/joesghub/agentic-logistics-incident-response/blob/main/screenshots/008%20fin_agent_tools.png?raw=true)

| Tool Name | Description | Inputs | Table | Output |
|-----------------|-----------------|-----------------|-----------------|-----------------|
| Create Incident Tool    | Creates an incident record on the incident table   | customer_id, customer_name, <br> route_id, truck_id, problem_description   | Incident    | short_description, description, <br> assigned_to, state, impact, <br> urgency    |
| Supply Agreement Lookup Record Tool   | Finds the supply agreement record for the customer name or id that the user enters.   | customer_name, customer_id   | Supply Agreement    | stockout_penalty_rate, deliver_window_hours, <br> customer_name, customer_id, Sys ID
| Lookup Delivery Delay Record Tool   | Finds the delivery delay record for the route id that the user enters.   | route_id    | Delivery Delay    | status, route_id, proposed_routes, <br> problem_description, customer_id, calculated_impact, <br> truck_id, incident_sys_id
| Update Delivery Delay Record Tool  | Updates delivery delay record with calculated impacts  | calculated_impact, route_id, incident_sys_id   | Delivery Delay    | calculated_impact, status, incident_sys_id, assigned_to
| Calculated Impacts Tool  | Step-by-step calculation for the calculated impact    | eta_minutes, deliver_window_hours, stockout_penalty_rate   | Delivery Delay, Supply Agreement   |   See script below.  |

**Limitations of the AIA ReAct Engine in Numerical Computation**

- The AIA ReAct Engine reasons through language-based steps instead of performing strict numerical computation. 

- It’s optimized for logical reasoning and tool orchestration, not raw arithmetic.

- So sometimes it treats numbers as text or mis-parses values during reasoning and can easily produce math errors.

To avoid this issue we use an isolated calculation script:

````
(function(inputs) {
    // Parse numeric inputs safely
    var etaMinutes = parseFloat(inputs.eta_minutes);
    var deliveryWindow = parseFloat(inputs.deliver_window_hours);
    var penaltyRate = parseFloat(inputs.stockout_penalty_rate);

    // Step 1: convert minutes to hours
    var etaHours = etaMinutes / 60;

    // Step 2: subtract the delivery window
    var overageHours = etaHours - deliveryWindow;

    // Step 3: multiply by penalty rate
    var calculatedImpact = overageHours * penaltyRate;

    return {
        calculated_impact: calculatedImpact.toFixed(2)
    };
})(inputs);
````

#### Agent 2: Route Decision Agent

**Role**
````
You analyze route options and their calculated impacts to choose an optimal route based on business rules and cost optimization.
````

**Description**
````
Selects optimal routes and coordinates external communication.
````

**Instructions**
````
Step 1: Use the Lookup Delivery Delay Record Tool with the route id the user entered. Store the route id in permanently in memory as memory.route_id 

Step 2: Analyze the route options and select an option_id that optimizes the corresponding distance_miles and calculated_impact. Store the **entire route object** (including option_id, route_number, distance_miles, and eta_minutes) in your memory as memory.chosen_option, not just the option_id string.
memory.chosen_option must be a structured JSON object, not plain text.

Step 3: Present the memory.chosen_option JSON object and your reasoning to the user. 

Step 4: Use the Update Delivery Delay Record Tool with:
- chosen_option = the entire memory.chosen_option JSON object
- status = approved

Step 5: Use the Update Incident Tool. If the chosen_option is greater than or equal to $1000, update the incident urgency and impact to 1 - High. If the chosen_option is greater than or equal to $500 and less than $1000, update the incident urgency and impact to 2 - Medium. If the chosen_option is less than $500, update the incident urgency and impact to 3 - Low.

Step 6: Use the N8N Delivery Route Data Webhook Tool with memory.route_id.

Step 7: Thank the user
````

**Proficiency**
````
- The agent is proficient in analyzing multiple route options, evaluating their impacts, and selecting the most optimal route based on predefined business rules and cost considerations. This involves a deep understanding of logistics, cost analysis, and decision-making processes.
- The agent can effectively utilize the Lookup Delivery Delay Record Tool to retrieve and store route information, specifically the route_id, which is critical for initiating the analysis of delivery delays and optimizing route selection.
- The agent is capable of storing complex route data structures in memory, including option_id, route_number, distance_miles, and eta_minutes, allowing for detailed analysis and informed decision-making.
- The agent can present detailed JSON objects of chosen route options to users, along with a clear explanation of the reasoning behind the selection, ensuring transparency and user understanding.
- The agent can utilize the Update Delivery Delay Record Tool to update delivery delay records with the chosen route option and status, ensuring that all records reflect the most current and optimal routing decisions.
- The agent can employ the Update Incident Tool to modify incident urgency and impact levels based on the financial implications of the chosen route option, ensuring that incidents are prioritized according to their significance.
- The agent can leverage the N8N Delivery Route Data Webhook Tool to transmit route data to external systems using the stored route_id, facilitating seamless integration and data sharing across platforms.
- The agent is capable of concluding interactions with users by expressing gratitude, thereby enhancing user experience and fostering positive relationships.
````

![](https://github.com/joesghub/agentic-logistics-incident-response/blob/main/screenshots/009%20route_agent.png?raw=true)

**Route Decision Agent Tools:**

![](https://github.com/joesghub/agentic-logistics-incident-response/blob/main/screenshots/010%20route_agent_tools.png?raw=true)

| Tool Name | Description | Inputs | Table | Output |
|-----------------|-----------------|-----------------|-----------------|-----------------|
| Update Incident Tool    | Updates an incident record on the incident table.   | incident_sys_id, impact, urgency  | Incident    | impact, urgency   
| Lookup Delivery Delay Record Tool   | Finds the delivery delay record for the route id that the user enters.   | route_id    | Delivery Delay    | status, route_id, proposed_routes, <br> problem_description, customer_id, calculated_impact, <br> truck_id, incident_sys_id
| Update Delivery Delay Record Tool  | Updates delivery delay record with chosen option.  | chosen_option, route_id   | Delivery Delay    | chosen_option, route_id
| Calculated Impacts Tool  | ServiceNow server-side script designed to <br> send delivery route data from ServiceNow to <br> an external N8N automation workflow via webhook    | route_id   | Delivery Delay, Supply Agreement   |   [notated-n8n-webhook.js](https://github.com/joesghub/agentic-logistics-incident-response/blob/main/notated-n8n-webhook.js)  |


### Step 5: n8n Workflow Setup

![](https://github.com/joesghub/agentic-logistics-incident-response/blob/main/screenshots/010a%20n8n_flow.png?raw=true)

**n8n Agent Purpose ** 

The n8n AI agent receives webhook payloads containing routing decisions, coordinates execution with external logistics providers, sends customer notifications, and updates ServiceNow with execution status. The agent constructs appropriate payloads for each external system while maintaining consistent data flow.

#### n8n Workflow Nodes (All With Successful Executions):
- Webhook (receives ServiceNow routing decisions)
![](https://github.com/joesghub/agentic-logistics-incident-response/blob/main/screenshots/011%20webhook_node.png?raw=true)

- AI Agent (coordinates external system calls)
![](https://github.com/joesghub/agentic-logistics-incident-response/blob/main/screenshots/012%20agent_node.png?raw=true)

- AI Agent Prompt
![](https://github.com/joesghub/agentic-logistics-incident-response/blob/main/screenshots/012a%20agent_node_prompt.png?raw=true)

- AWS Bedrock Chat Model (connected to AI Agent)
![](https://github.com/joesghub/agentic-logistics-incident-response/blob/main/screenshots/013%20bedrock_node.png?raw=true)

- Logistics MCP Client (connects to logistics provider systems)
![](https://github.com/joesghub/agentic-logistics-incident-response/blob/main/screenshots/014%20logistics_mcp.png?raw=true)

- Retail MCP Client (connects to customer notification systems)
![](https://github.com/joesghub/agentic-logistics-incident-response/blob/main/screenshots/015%20retail_mcp.png?raw=true)

- ServiceNow MCP Client (updates execution status back to ServiceNow)
![](https://github.com/joesghub/agentic-logistics-incident-response/blob/main/screenshots/016%20servicenow_mcp.png?raw=true)


## Architecture Diagram
![PEPSICO & SERVICENOW LOGISTICS RESOLUTION AI AGENT FLOW](https://github.com/joesghub/agentic-logistics-incident-response/blob/main/Diagram.png?raw=true)

## Optimization
Analysis of how you optimized the system for efficiency, reliability, and performance. Document specific optimizations implemented (such as webhook URL configuration, script efficiency improvements, error handling enhancements, or workflow streamlining) and identify future optimization opportunities (such as caching strategies, parallel processing possibilities, advanced error recovery mechanisms, or enhanced monitoring capabilities).

## Testing Results
Evidence of successful end-to-end system operation with specific examples of financial analysis, routing decisions, and external execution

### Route Financial Analysis Agent Results
![](https://github.com/joesghub/agentic-logistics-incident-response/blob/main/screenshots/017%20fin_agent_results.png?raw=true)


### Route Decision Agent Results
![](https://github.com/joesghub/agentic-logistics-incident-response/blob/main/screenshots/018%20route_agent_results.png?raw=true)


### Logistics Breakdown Resolution Use Case Results
![](https://github.com/joesghub/agentic-logistics-incident-response/blob/main/screenshots/019%20draft%20use%20case.png?raw=true)


## Business Value
Analysis of how the system improves PepsiCo's supply chain operations, reduces manual intervention, and optimizes delivery cost management
