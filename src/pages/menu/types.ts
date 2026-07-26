export interface Ingredient {
  inventory_item: string;
  quantity: number;
}

export interface DishForm {
  name: string;
  price: string;
  description: string;
  category_id: string;
  prep_time: string;
  available: boolean;
  image: File | null;
  ingredients_data: Ingredient[];
}

export interface DishDraft {
  id: string;
  savedAt: number;
  form: Omit<DishForm, 'image'> & { imagePreview: string | null };
}
