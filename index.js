const path = require("path");
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const PORT = process.env.PORT || 5000;

const Network = require("./network");

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));

  app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

app.use("/point", Network.PointServices);
app.use("/node", Network.getNode);
app.use("/route", Network.getRoute);

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
  console.log(`
All Path : 
  - Network Analysis
  /point
  /node
    /node/:lat&:lng
  /route
    /route/:from&:to
`);
});
