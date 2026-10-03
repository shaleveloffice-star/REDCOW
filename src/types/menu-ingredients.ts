/** Dish ingredient shown beside the sauces on the dish page; never listed in the public menu. */
export type MenuIngredient = {
  id: string;
  name: string;
  nameEn?: string;
  nameFr?: string;
  description?: string;
  descriptionEn?: string;
  descriptionFr?: string;
  imageUrl: string;
  /** Centered visual zoom, 1 (original) through 3; does not modify the asset. */
  imageZoom?: number;
  isActive: boolean;
  sortOrder: number;
};

export type MenuIngredientsDocument = {
  items: MenuIngredient[];
  updatedAt: string;
};
