import { onRequest as __api___route___js_onRequest } from "C:\\Users\\Ash\\OneDrive\\Desktop\\ELVEN\\elven_package\\functions\\api\\[[route]].js"

export const routes = [
    {
      routePath: "/api/:route*",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api___route___js_onRequest],
    },
  ]