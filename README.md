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

![]()

The `assigned_to` field in Delivery Delay table serves as the execution context for AI agent triggers. This ensures proper permissions and security boundaries when agents process records automatically.

In this system, our Schneider's Breakdown Notification Agent is unable to properly assign the `assigned_to` field due to security permissions. 

However, I used a ServiceNow Workflow to remedy this issue by assigning new records ont he table to System Administrator. 

![]()

#### Supply Agreement Table

The second table in my system is a Supply Agreement table. It holds the contractual penalties for late shipments from Whole Foods (Retail Client).

**Supply Agreement Table Fields:**
- `customer_id` (Integer, Primary Key)
- `customer_name` (String, 100)

- `deliver_window_hours` (Integer) - Contractual delivery timeframe
 
- **`deliver_window_hours`**: The contractual timeframe (in hours) within which deliveries must be completed to avoid penalties. For Whole Foods, deliveries must be completed within 3 hours of departure to avoid charges.
 
- `stockout_penalty_rate` (Integer) - Cost per hour of delay in dollars
  
- **`stockout_penalty_rate`**: The financial penalty (in dollars) assessed for every hour a delivery exceeds the contractual delivery window. Whole Foods charges PepsiCo $250 for each hour beyond the 3-hour delivery window. For example, a 5-hour delivery would incur penalties for 2 hours (5 minus 3), resulting in a $500 penalty charge.

### Step 3: Use Case and Trigger Setup

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

![]()

The trigger is configured to run the use case as the assigned user for any created or updated delivery delay records with a Status of `pending`.

![]()

### Step 4: AI Agent Setup

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


![]()


![]()


![]()


![]()


![]()


![]()


![]()



![]()


![]()
![]()

![]()

![]()
![]()
![]()
![]()
![]()
![]()
![]()
![]()
![]()


## Architecture Diagram
![PEPSICO & SERVICENOW LOGISTICS RESOLUTION AI AGENT FLOW](https://github.com/joesghub/agentic-logistics-incident-response/blob/main/Diagram.png?raw=true)

## Optimization
Analysis of how you optimized the system for efficiency, reliability, and performance. Document specific optimizations implemented (such as webhook URL configuration, script efficiency improvements, error handling enhancements, or workflow streamlining) and identify future optimization opportunities (such as caching strategies, parallel processing possibilities, advanced error recovery mechanisms, or enhanced monitoring capabilities).

## Testing Results
Evidence of successful end-to-end system operation with specific examples of financial analysis, routing decisions, and external execution

## Business Value
Analysis of how the system improves PepsiCo's supply chain operations, reduces manual intervention, and optimizes delivery cost management
