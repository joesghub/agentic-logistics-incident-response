(function (inputs) {
  // Configuration - Set webhook URL here
  // This is the N8N webhook endpoint the script will call, triggering an N8N workflow externally
  var WEBHOOK_URL = 'https://joekn8n.app.n8n.cloud/webhook-test/c2471702-1e1b-4815-ad00-4e6fe04eb1e5';

  // Expects an input called route_id, returns an error result if missing
  try {
    var routeId = inputs.route_id;
    if (!routeId) {
      return {
        success: 'false',
        message: 'Route ID is required',
        route_id: 'not_provided',
      };
    }

    // Get the delivery delay record to include additional context, looks in the custom table
    var delayGr = new GlideRecord('x_snc_pepsico_de_0_delivery_delay');
    delayGr.addQuery('route_id', routeId);
    delayGr.query();

    // If no record is found, it returns an error.
    if (!delayGr.next()) {
      return {
        success: 'false',
        message: 'Delivery delay record not found for route: ' + routeId,
        route_id: routeId,
      };
    }

    // Collects the sys_id, the truck ID, and a JSON field chosen_option
    var delaySysId = delayGr.getUniqueValue();
    var truckId = delayGr.getValue('truck_id');
    var chosenOptionJson = delayGr.getValue('chosen_option');

    gs.info('N8N Webhook: Found delivery delay record, sys_id=' + delaySysId);

    // Parse chosen_option JSON if it's stored as string
    var chosenOption;
    try {
      chosenOption =
        typeof chosenOptionJson === 'string'
          ? JSON.parse(chosenOptionJson)
          : chosenOptionJson;
    } catch (e) {
      return {
        success: 'false',
        message: 'Failed to parse chosen_option JSON: ' + e.message,
        route_id: routeId,
      };
    }

    // Prepare clean JSON object webhook payload matching the expected format that N8N will receive.
    var webhookPayload = {
      route_id: routeId,
      truck_id: truckId,
      chosen_option: chosenOption,
    };

    // Make API call to N8N webhook
    // Uses the ServiceNow RESTMessageV2 API to call the N8N webhook.
    // Sends the route info as a JSON payload via POST.
    var request = new sn_ws.RESTMessageV2();
    request.setEndpoint(WEBHOOK_URL);
    request.setHttpMethod('POST');
    // Tells N8N what format the request body is in.
    request.setRequestHeader('Content-Type', 'application/json');
    // Tells N8N what type of response ServiceNow expects back.
    request.setRequestHeader('Accept', 'application/json');

    var requestBody = JSON.stringify(webhookPayload);
    request.setRequestBody(requestBody);

    // Measures response time.
    var startTime = new Date().getTime();
    var response = request.execute();
    var endTime = new Date().getTime();
    var responseTime = endTime - startTime;

    // Checks if the webhook returned a successful status
    var httpStatusCode = response.getStatusCode();
    var responseBody = response.getBody();
    var errorMessage = response.getErrorMessage();
    var isSuccess = httpStatusCode >= 200 && httpStatusCode < 300;

    // Logs results via gs.info()
    gs.info(
      'N8N Webhook: API Response - Status: ' +
        httpStatusCode +
        ', Body: ' +
        responseBody
    );

    return {
      // Whether the webhook succeeded — converted to string "true" or "false"
      success: isSuccess.toString(),
      // If isSuccess is true, it shows the success message with route ID and response time 
      // If false, it includes HTTP code and error info.
      message: isSuccess
        ? 'N8N workflow triggered successfully! Route ' +
          routeId +
          ' execution initiated. Response time: ' +
          responseTime +
          'ms'
        : 'Webhook failed - HTTP ' +
          httpStatusCode +
          ': ' +
          (errorMessage || responseBody),
      route_id: routeId,
      truck_id: truckId,
      // Serialized JSON of the route choice (stringified for logging).
      chosen_option: JSON.stringify(chosenOption),
      http_status: httpStatusCode.toString(),
      response_time_ms: responseTime.toString(),
      webhook_url: WEBHOOK_URL,
    };
  } catch (e) {
    var errorMsg = 'Exception in N8N webhook call: ' + e.message;
    // Logs the error to the system log using gs.error()
    // This helps developers see stack traces in System Logs → All.
    gs.error('N8N Webhook error: ' + errorMsg);

    return {
      success: 'false',
      message: errorMsg,
      route_id: inputs.route_id || 'unknown',
      webhook_url: WEBHOOK_URL,
    };
  }
})(inputs);
