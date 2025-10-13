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
