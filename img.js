const fs = require("fs");
const JSDOM = require("jsdom");

const nodeHtmlToImage = require("node-html-to-image");

async function createImg() {
  nodeHtmlToImage({
    output: "./image.png",
    selector: 'table',
    html: "<table border=1><tr><td>Rank</td><td>Team Name</td><td>Wins</td><td>Losses</td><td>Points</td><td>PF</td></tr><tr><td>1</td><td>Regretful Friend Choices</td><td>4</td><td>0</td><td>13</td><td>553.88</td></tr><tr><td>2</td><td>Spain without The S</td><td>4</td><td>0</td><td>13</td><td>506.4</td></tr><tr><td>3</td><td>Watson/Kraft Massage Therapy</td><td>3</td><td>1</td><td>10</td><td>494.38</td></tr><tr><td>4</td><td>Rich Fucks</td><td>3</td><td>1</td><td>9</td><td>529.72</td></tr><tr><td>5</td><td>Alexandria Ocasio Kyle</td><td>3</td><td>1</td><td>9</td><td>493.8</td></tr><tr><td>6</td><td>Lockdown 2: Electric Avenue</td><td>3</td><td>1</td><td>9</td><td>419.52</td></tr><tr><td>7</td><td>DJ is Fringe Guy</td><td>2</td><td>2</td><td>7</td><td>535.24</td></tr><tr><td>8</td><td>Vocal Minority</td><td>2</td><td>2</td><td>7</td><td>519.18</td></tr><tr><td>9</td><td>Austin's City Limits</td><td>2</td><td>2</td><td>6</td><td>440.8</td></tr><tr><td>10</td><td>Bishop Sycamore High School</td><td>1</td><td>3</td><td>4</td><td>492.52</td></tr><tr><td>11</td><td>Loads of Ludes</td><td>1</td><td>3</td><td>3</td><td>485.18</td></tr><tr><td>12</td><td>Only Cams</td><td>0</td><td>4</td><td>1</td><td>459.1</td></tr><tr><td>13</td><td>Superb Owls</td><td>0</td><td>4</td><td>0</td><td>427.66</td></tr><tr><td>14</td><td>I ❤️ Kickers and Defenses</td><td>0</td><td>4</td><td>0</td><td>404.64</td></tr></table>",
  }).then(() => console.log("The image was created successfully!"));
}

createImg();
