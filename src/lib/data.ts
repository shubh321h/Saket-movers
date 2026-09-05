/**
 * Content model for Saket Packers & Movers (Ayodhya).
 *
 * Everything the generator can say about a customer's job comes from this file
 * plus the customer's own taps. Nothing here invents names, prices, distances,
 * dates or incidents — the phrases describe qualities the customer selected.
 */

export interface ServiceOption {
  id: string;
  label: string;
  hint: string;
  icon: string;
  /** Noun phrases that fill the {svc} slot, lowercase, ready after a preposition. */
  refs: string[];
}

export interface LikeOption {
  id: string;
  label: string;
  phrases: string[];
}

export interface ImproveOption {
  id: string;
  label: string;
  phrases: string[];
}

export const BUSINESS = {
  name: "Saket Packers & Movers",
  fullName: "Saket Packers & Movers Ayodhya",
  address: "Cantt Rd, Niyawan, Faizabad, Uttar Pradesh 224001",
  mapsShortLink: "https://maps.app.goo.gl/pS6FZHudLgQkaoXh7",
  /** Derived from the CID inside the owner's Maps link and verified against it. */
  placeId: "ChIJA4Rb4RYHmjkRgRUAjvI9Mg8",
};

export const SERVICES: ServiceOption[] = [
  {
    id: "home",
    label: "Home shifting",
    hint: "Household goods",
    icon: "home",
    refs: ["household shifting", "the home shift", "the move to the new place", "the shifting work", "our relocation"],
  },
  {
    id: "local",
    label: "Local shifting",
    hint: "Within the city",
    icon: "pin",
    refs: ["local shifting", "the move within the city", "our local relocation", "the shift across town"],
  },
  {
    id: "intercity",
    label: "Intercity transport",
    hint: "City to city",
    icon: "truck",
    refs: ["intercity transport", "the long-distance shift", "moving everything to another city", "our outstation move"],
  },
  {
    id: "office",
    label: "Office relocation",
    hint: "Office & workspace",
    icon: "office",
    refs: ["office relocation", "the office move", "shifting the office", "moving the workspace"],
  },
  {
    id: "packing",
    label: "Packing & unpacking",
    hint: "Wrapping and boxing",
    icon: "package",
    refs: ["the packing work", "the packing and unpacking", "getting everything packed", "the packing service"],
  },
  {
    id: "loading",
    label: "Loading & unloading",
    hint: "Lifting help",
    icon: "hand",
    refs: ["loading and unloading", "the lifting work", "getting the goods loaded", "the labour for the move"],
  },
  {
    id: "vehicle",
    label: "Bike & car transport",
    hint: "Vehicle shifting",
    icon: "car",
    refs: ["bike transport", "transporting the car", "vehicle transportation", "moving the vehicle"],
  },
  {
    id: "furniture",
    label: "Single item move",
    hint: "Sofa, bed, wardrobe",
    icon: "sofa",
    refs: ["moving a few large items", "the furniture move", "shifting the wardrobe", "the single-item delivery"],
  },
  {
    id: "storage",
    label: "Storage",
    hint: "Short or long term",
    icon: "warehouse",
    refs: ["the storage arrangement", "keeping our goods in their warehouse", "the warehousing", "the safe-keeping of our things"],
  },
  {
    id: "business",
    label: "Business goods",
    hint: "Stock, shop, machinery",
    icon: "boxes",
    refs: ["business goods transport", "moving the shop stock", "the commercial transport", "shifting the business inventory"],
  },
];

export const LIKES: LikeOption[] = [
  { id: "ontime", label: "On-time pickup & drop", phrases: ["the punctual pickup and drop", "the way everything ran to schedule", "their timing on the day", "their arrival as promised", "the on-time service"] },
  { id: "packing", label: "Careful packing", phrases: ["the quality of the packing", "the secure wrapping and boxing of everything", "the care taken while packing", "the way the fragile pieces were packed"] },
  { id: "handling", label: "Safe handling of goods", phrases: ["the careful handling of our belongings", "the gentle way everything was loaded and unloaded", "the care taken with the heavier items", "the absence of any rushing around"] },
  { id: "crew", label: "Polite, professional crew", phrases: ["the polite and professional crew", "the courteousness of the staff", "the behaviour of the team", "the way the staff spoke to us"] },
  { id: "vehicle", label: "Clean, well-kept vehicle", phrases: ["the clean and well-maintained truck", "the condition of the vehicle", "the state the truck was kept in"] },
  { id: "price", label: "Fair, transparent pricing", phrases: ["the fair price", "the transparency of the costing", "the rate we were quoted", "the price staying as agreed"] },
  { id: "nohidden", label: "No hidden charges", phrases: ["the absence of any last-minute charges", "the lack of hidden extras", "the final bill matching the quote"] },
  { id: "speed", label: "Quick loading & unloading", phrases: ["the speed of the loading", "the speed of the loading and unloading", "the short time the whole thing took"] },
  { id: "safe", label: "Everything arrived safely", phrases: ["the safe delivery of everything", "the condition our goods arrived in", "nothing arriving damaged"] },
  { id: "comm", label: "Clear updates", phrases: ["the clear communication", "the way they kept us informed", "the updates along the way", "always knowing what was happening"] },
  { id: "booking", label: "Easy booking & dates", phrases: ["the ease of booking", "the smooth scheduling", "the simplicity of fixing a date", "the flexibility on timing"] },
  { id: "respect", label: "Respect for the home", phrases: ["the respect shown for our home", "the neat way they worked inside", "the care taken with the floors and walls"] },
  { id: "coord", label: "Good coordination", phrases: ["the coordination between the loading and unloading teams", "the way the two teams worked together", "the smooth handover at the other end"] },
  { id: "value", label: "Value for money", phrases: ["the value for money", "the service we got for what we paid", "the overall worth of the service"] },
];

export const IMPROVE: ImproveOption[] = [
  { id: "timing", label: "Pickup timing", phrases: ["the pickup timing", "the schedule on the day"] },
  { id: "packing", label: "Packing material", phrases: ["the packing material", "the wrapping and boxing"] },
  { id: "comm", label: "Communication", phrases: ["the communication", "the updates we received"] },
  { id: "handling", label: "Handling of items", phrases: ["the handling of some of the items", "the care during loading"] },
  { id: "pricing", label: "Pricing clarity", phrases: ["the clarity in the pricing", "how the charges were explained"] },
  { id: "coord", label: "Team coordination", phrases: ["the coordination between the teams", "how the work was divided"] },
  { id: "vehicle", label: "Vehicle condition", phrases: ["the condition of the vehicle"] },
  { id: "speed", label: "Unloading time", phrases: ["the time taken to unload"] },
  { id: "followup", label: "Follow-up", phrases: ["the follow-up after the shift"] },
  { id: "schedule", label: "Date flexibility", phrases: ["the flexibility on the date"] },
];

export const RATING_WORDS = ["Poor", "Not great", "Good", "Great", "Excellent"];

export const RATING_HINTS: Record<number, string> = {
  1: "Sorry to hear that. Tell us what fell short.",
  2: "We'd like to do better. What fell short?",
  3: "Thanks — mixed feedback helps the most.",
  4: "Nice one. What did you like most?",
  5: "Wonderful! What made it work for you?",
};
