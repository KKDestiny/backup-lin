/*
 * @Date: 2022-07-25 22:48:20
 * @LastEditors: linxiaozhou.com
 * @Description: Description
 */
import path from "path";

import express from "express";
import bodyParser from "body-parser";

import routers from "./routes/index";

// EXPRESS APP //////////////////////////////////////////
const app = express();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "./views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "../public")));

app.use("/", routers);

export default app;
