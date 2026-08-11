export type CanvasObject = {
  id: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize?: number;
  rotation?: number;
};

export const defaultLayout = {
  photo: {
    id: "photo",
    x: 275,
    y: 170,
    width: 150,
    height: 150,
  },

  name: {
    id: "name",
    x: 110,
    y: 452,
    fontSize: 32,
  },

  programme: {
    id: "programme",
    x: 110,
    y: 520,
    fontSize: 24,
  },

  category: {
    id: "category",
    x: 110,
    y: 555,
    fontSize: 20,
  },

  team: {
    id: "team",
    x: 180,
    y: 752,
    fontSize: 26,
  },
};