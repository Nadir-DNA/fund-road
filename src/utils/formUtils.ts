
// Utility functions for form handling

/**
 * Converts string values to string arrays for Supabase investor form
 */
export const prepareInvestorFormData = (formData: any) => {
  return {
    ...formData,
    // Convert single string values to arrays if they're not already arrays
    location: Array.isArray(formData.location) ? formData.location : [formData.location],
    stage: Array.isArray(formData.stage) ? formData.stage : [formData.stage],
    type: Array.isArray(formData.type) ? formData.type : [formData.type],
    ticket: Array.isArray(formData.ticket) ? formData.ticket : [formData.ticket],
    // Ensure sectors is always an array
    sectors: Array.isArray(formData.sectors) ? formData.sectors : 
             (formData.sectors ? [formData.sectors] : [])
  };
};
