/**
 * flight-details-api.js
 * Wrapper around the real Test.GetFlightDetails REST API - the source of
 * truth for FlightNumber/FlightTime/BoardingPass. Falls back to an embedded
 * copy of a real sample response when the live call fails (expected when
 * opened via file:// or blocked by CORS, since this is a cross-origin call
 * to Planet's test service with no browser-side auth/CORS headers
 * configured for static-file callers).
 */
const FlightDetailsApi = (function () {
  'use strict';

  const BASE_URL = 'https://globaltes-taxfree.planetpayment.com/ServiceTests/rest/Test/GetFlightDetails';

  // Verbatim real sample response supplied for this investigation - used only
  // as an offline fallback, never invented/synthetic data.
  const SAMPLE_RESPONSE = {
    FlightDetails: [
      { FlightTime: '24-09-2026 14:55', FlightTimeHours: '12:00 - 17:59', FlightTimeMinutes: '14:30 - 14:59', FlightNumber: 'EK 9', BoardingPass: 'M1JOHN/SMITH          E       DXBLGWEK 9    267           00' },
      { FlightTime: '24-09-2026 14:55', FlightTimeHours: '12:00 - 17:59', FlightTimeMinutes: '14:30 - 14:59', FlightNumber: 'EK 37', BoardingPass: 'M1JOHN/SMITH          E       DXBBHXEK 37   267           00' },
      { FlightTime: '24-09-2026 14:55', FlightTimeHours: '12:00 - 17:59', FlightTimeMinutes: '14:30 - 14:59', FlightNumber: 'EK 857', BoardingPass: 'M1JOHN/SMITH          E       DXBKWIEK 857  267           00' },
      { FlightTime: '24-09-2026 15:00', FlightTimeHours: '12:00 - 17:59', FlightTimeMinutes: '15:00 - 15:29', FlightNumber: 'FZ 997', BoardingPass: 'M1JOHN/SMITH          E       DXBSVXFZ 997  267           00' },
      { FlightTime: '24-09-2026 15:00', FlightTimeHours: '12:00 - 17:59', FlightTimeMinutes: '15:00 - 15:29', FlightNumber: 'IA 124', BoardingPass: 'M1JOHN/SMITH          E       DXBBGWIA 124  267           00' },
      { FlightTime: '24-09-2026 15:00', FlightTimeHours: '12:00 - 17:59', FlightTimeMinutes: '15:00 - 15:29', FlightNumber: 'EK 608', BoardingPass: 'M1JOHN/SMITH          E       DXBKHIEK 608  267           00' },
      { FlightTime: '24-09-2026 15:00', FlightTimeHours: '12:00 - 17:59', FlightTimeMinutes: '15:00 - 15:29', FlightNumber: 'EK 528', BoardingPass: 'M1JOHN/SMITH          E       DXBHYDEK 528  267           00' },
      { FlightTime: '24-09-2026 15:00', FlightTimeHours: '12:00 - 17:59', FlightTimeMinutes: '15:00 - 15:29', FlightNumber: 'EK 61', BoardingPass: 'M1JOHN/SMITH          E       DXBHAMEK 61   267           00' },
      { FlightTime: '24-09-2026 15:10', FlightTimeHours: '12:00 - 17:59', FlightTimeMinutes: '15:00 - 15:29', FlightNumber: 'EK 809', BoardingPass: 'M1JOHN/SMITH          E       DXBMEDEK 809  267           00' },
      { FlightTime: '24-09-2026 15:10', FlightTimeHours: '12:00 - 17:59', FlightTimeMinutes: '15:00 - 15:29', FlightNumber: 'EK 163', BoardingPass: 'M1JOHN/SMITH          E       DXBDUBEK 163  267           00' }
    ],
    ErrorMessage: ''
  };

  /**
   * Calls the real GetFlightDetails endpoint. Falls back to the embedded
   * sample response if the network call fails or the API reports an error.
   * @param {{country:string, location:string, status:string|number}} params
   * @returns {Promise<{flights:Array, usedFallback:boolean, errorMessage:string}>}
   */
  async function fetchFlightDetails(params) {
    params = params || {};
    const query = new URLSearchParams({
      Country: params.country || '',
      Location: params.location || '',
      Status: params.status !== undefined ? String(params.status) : ''
    });

    try {
      const response = await fetch(BASE_URL + '?' + query.toString());
      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }
      const json = await response.json();
      if (json.ErrorMessage) {
        throw new Error(json.ErrorMessage);
      }
      return { flights: json.FlightDetails || [], usedFallback: false, errorMessage: '' };
    } catch (err) {
      console.warn('[FlightDetailsApi] Live call failed, falling back to embedded sample response:', err.message);
      return { flights: SAMPLE_RESPONSE.FlightDetails, usedFallback: true, errorMessage: err.message };
    }
  }

  return {
    BASE_URL: BASE_URL,
    fetchFlightDetails: fetchFlightDetails
  };
})();
