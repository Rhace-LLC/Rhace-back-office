// src/api-services/entertainment/type.ts
import type { MenuItem } from "../menu.service";

/** GET /entertainment/build-your-dish/ */
export interface BuildYourDishOption {
  value: string;
  label: string;
}

export interface BuildYourDishQuestion {
  key: string;
  question: string;
  options: BuildYourDishOption[];
}

export interface BuildYourDishQuestionsResponse {
  questions: BuildYourDishQuestion[];
}

/** GET /entertainment/did-you-know/ */
export interface DidYouKnowFact {
  id: number;
  category: string;
  text: string;
}

export interface DidYouKnowResponse {
  count: number;
  facts: DidYouKnowFact[];
}

/**
 * Body for POST /entertainment/restaurants/{restaurant_id}/build-your-dish/.
 * Keys mirror BuildYourDishQuestion.key; answers are top-level fields.
 */
export interface BuildYourDishPayload {
  mood: string;
  spice_tolerance: string;
  appetite: string;
  [key: string]: string | undefined;
}

/** The chosen answers echoed back in the response. */
export interface BuildYourDishAnswers {
  mood: string;
  spice_tolerance: string;
  appetite: string;
  [key: string]: string;
}

/**
 * The recommended dish. Same shape as a menu item, plus the promotion price
 * applied by the promotion engine.
 */
export interface BuildYourDishRecommendation extends MenuItem {
  promotion_price: string | null;
}

/** POST /entertainment/restaurants/{restaurant_id}/build-your-dish/ */
export interface BuildYourDishResult {
  answers: BuildYourDishAnswers;
  recommendation: BuildYourDishRecommendation;
}
