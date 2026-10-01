(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.StackLabPuyoPatterns = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  // Transcribed from the linked wiki's embedded legacy chainsim strings.
  // Legacy: 4=red, 7=green, 5=blue, 6=yellow, 3=block support.
  const roles = {"0":".","4":"A","7":"B","5":"C","6":"D","3":"#"};
  function record(id,name,page,section,chain,explanation,kind="example") {
    const padded = chain.padStart(Math.ceil(chain.length/6)*6,"0");
    const grid = padded.match(/.{6}/g).map(row => [...row].map(c => roles[c]).join(""));
    return {id,name,aliases:[],source:`https://puyonexus.com/wiki/${page}#${section}`,chain,
      simulator:`https://puyonexus.com/chainsim/?w=6&h=12&chain=${chain}`,
      grid,kind,legend:"A red · B green · C blue · D yellow · # support · . empty. Colors represent interchangeable roles.",
      explanation,alt:`${name}. Rows from top to bottom: ${grid.join(", ")}. ${explanation}`};
  }
  const records = [
    record("stairs31","3-1 Stairs","Stairs","3-1_Stairs","47650054765054765554765",
      "The source includes the left blue ignition group. Its clear lets the neighboring three-plus-one groups join sideways, continuing to the right."),
    record("stairs22","2-2 Stairs","Stairs","2-2_Stairs","47650047650554765554765",
      "The left blue ignition is included. Two Puyos fall beside two of the same role after the supporting group clears. Watch for unwanted same-color contact."),
    record("gtr","GTR base","Patterns_and_Transitions_3:_GTR_%26_More","GTR","740000774000443000",
      "Foundation only: add green to the three-green group on the left to ignite. The red hook then falls toward the two reds below; it needs an extension to continue. # is the source's support block, not a color.","foundation"),
    record("sandwich112","1-1-2 Sandwich","Sandwich","1-1-2_Sandwich","5057645457645445764457645",
      "The left red ignition is included. Removing the separator lets the two upper Puyos fall onto matching singles below, making a vertical connection."),
    record("sandwich211","2-1-1 Sandwich","Sandwich","2-1-1_Sandwich","4046574774657746574746574",
      "The left green ignition is included. A lower pair and two separated singles reconnect vertically as the intervening groups clear."),
    record("sandwich301","3-0-1 Sandwich","Sandwich","3-0-1_Sandwich","4045674074674745567745674",
      "Add green B in the marked gap on the left to ignite. Study the blue role C: a connected three and an upper single join after their support clears. There is no middle blue; this bridges mixed Sandwich forms.")
  ];
  const triggers = [
    {x:0,y:3,role:"C",included:true}, {x:0,y:3,role:"C",included:true},
    {x:0,y:0,role:"B",included:false}, {x:0,y:4,role:"A",included:true},
    {x:0,y:4,role:"B",included:true}, {x:0,y:2,role:"B",included:false}
  ];
  records.forEach((record,i) => {record.trigger=triggers[i]; record.alt += ` Ignition ${triggers[i].included ? "included" : "add"}: ${triggers[i].role}, column ${triggers[i].x+1}, row ${triggers[i].y+1} from top.`;});
  // GTR's added green belongs above the base, not on top of an existing cell.
  records[2].trigger = {x:0,y:-1,role:"B",included:false};
  records[2].alt = "GTR foundation. Rows from top: BA...., BBA..., AA#... . Add B above column 1 to ignite. # is fixed support. An extension is required.";
  records.forEach(record => {record.aliases = record.id.startsWith("stairs") ? ["Kaidan"] : record.id === "gtr" ? ["Great Tanaka Rensa"] : ["Hasamikomi","Key"];});
  return records;
});
