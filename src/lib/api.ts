
import { API_ENDPOINTS } from "./constants";

/**
 * Uploads a WAV audio file to the backend server
 * @param audioBlob The audio blob to upload
 * @returns A promise that resolves to the response data
 */
export async function uploadAudio(audioBlob: Blob): Promise<any> {
  try {
    // Create a FormData object to send the audio file
    const formData = new FormData();

    // Convert blob to File object with WAV extension
    const audioFile = new File([audioBlob], "audio_recording.wav", {
      type: "audio/wav",
    });

    // Append the file to the FormData object
    formData.append("file", audioFile);

    // Send the POST request to the upload endpoint
    const response = await fetch(API_ENDPOINTS.UPLOAD, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    // Check if the response is HTML instead of JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      console.error("Received HTML response instead of JSON");
      throw new Error("Invalid response format: received HTML instead of JSON");
    }

    return await response.json();
  } catch (error) {
    console.error("Error uploading audio:", error);
    throw error;
  }
}

/**
 * Checks the status of a process
 * @param processId The ID of the process to check
 * @returns A promise that resolves to the process status data
 */
export async function checkProcessStatus(processId: string): Promise<any> {
  try {
    const response = await fetch(`${API_ENDPOINTS.STATUS}/${processId}`, {
      method: "GET",
      headers: {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': '69420' // Add ngrok header to bypass browser warning
      }
    });

    if (!response.ok) {
      throw new Error(`Status check failed with status ${response.status}`);
    }

    // Check if the response is HTML instead of JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      console.error("Received HTML response instead of JSON");
      return { 
        status: "failed", 
        error: "Invalid response format: received HTML instead of JSON" 
      };
    }

    return await response.json();
  } catch (error) {
    console.error("Error checking process status:", error);
    return { 
      status: "failed", 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Polls the status of a process until it completes or fails
 * @param processId The ID of the process to poll
 * @param intervalMs The polling interval in milliseconds
 * @param maxAttempts Maximum number of polling attempts (0 for infinite)
 * @returns A promise that resolves to the final process status
 */
export async function pollProcessStatus(
  processId: string,
  intervalMs: number = 2000,
  maxAttempts: number = 30
): Promise<any> {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    console.log(
      `Starting to poll process ${processId} every ${intervalMs}ms (max ${maxAttempts} attempts)`
    );

    const checkStatus = async () => {
      attempts++;
      console.log(
        `Polling attempt ${attempts}/${maxAttempts} for process ${processId}`
      );

      try {
        const status = await checkProcessStatus(processId);
        console.log(`Poll #${attempts} result:`, status);

        // Check if processing is complete or failed
        if (status.status === "complete" || status.status === "failed") {
          console.log(
            `Processing ${status.status} after ${attempts} attempts:`,
            status
          );
          resolve(status);
          return;
        }

        // Check if we've reached the maximum number of attempts
        if (maxAttempts > 0 && attempts >= maxAttempts) {
          console.log(`Reached maximum ${maxAttempts} polling attempts`);
          resolve(status); // Resolve with the current status even though it's not complete
          return;
        }

        // Log when the next check will occur
        console.log(
          `Scheduling next poll (${attempts + 1}) in ${intervalMs}ms`
        );

        // Schedule the next check
        setTimeout(checkStatus, intervalMs);
      } catch (error) {
        console.error(`Error during poll #${attempts}:`, error);
        reject(error);
      }
    };

    // Start polling
    checkStatus();
  });
}
