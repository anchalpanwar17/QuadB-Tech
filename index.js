import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';


const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

mongoose.connect("mongodb://127.0.0.1:27017/QuadB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("DB connection successfu!l"))
.catch((err) => console.log(err));

const tickerRowSchema = {
    platform: String,
    lastTradedPrice: Number,
    buyPrice: Number,
    sellPrice:  Number,
    volume: Number,
    base_unit: String,
    difference: Number,
    savings: Number
};

const ticker = mongoose.model("ticker", tickerRowSchema);

const tickersArr = [];
async function fetchTickers(){
    const response = await fetch("https://api.wazirx.com/api/v2/tickers");
      const data = await response.json();
      const tickers = Object.values(data);
      const top10tickers = tickers.slice(0,10);
    
    for(let i=0 ; i<top10tickers.length ; i++){
        const newTicker = new ticker({
            platform: "WazirX",
            lastTradedPrice: top10tickers[i].last,
            buyPrice: top10tickers[i].buy,
            sellPrice:  top10tickers[i].sell,
            volume: top10tickers[i].volume,
            baseUnit: top10tickers[i].base_unit,
            difference: 111, //hard-coded as there I cant find anything related to difference and savings in the api
            savings: 111
        });
        tickersArr.push(newTicker)

    }
    
    // console.log(tickersArr);
  }
    
fetchTickers();
app.get("/", (req,res) => {

  ticker.find({}, function(err, foundTickers){
    if(foundTickers.length === 0){
      ticker.insertMany(tickersArr, function(err) {
        if(err){
          console.log(err);
        }else{
          console.log("Saved to database successfully");
        }
      });
      res.render("/");
    }
    else{
      res.render("index.ejs", {ticker: foundTickers});
    }
   
  });
  
});
  

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});