(function (root, factory) {
  const openers = factory();
  if (typeof module === "object" && module.exports) module.exports = openers;
  if (root) root.StackLabOpeners = openers;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  return {
    tki: {
      variant: "TKI-3 · Fonzie variation",
      verified: true,
      sequence: "ILZSOJT",
      plan: [[3,0],[0,1],[3,0],[6,1],[8,0],[7,0],[1,2,19]],
      steps: [
        "Lay I flat across columns 4–7.",
        "Stand L against the left wall, with its foot pointing right.",
        "Place Z across columns 4–6 on top of the I.",
        "Stand S in columns 7–8 to shape the right side.",
        "Set O against the right wall.",
        "Lay J against the right wall above the O and S, with its hook raised on the left.",
        "Turn T upside down and kick it into the left cavity. The normal landing ghost will stay above it until the spin succeeds."
      ]
    },
    "dt-cannon": {
      variant: "DT Cannon · TSD → TST",
      verified: true,
      sequence: "LSJZTOILJZOISTT",
      plan: [
        [3,0],[3,0],[7,0],[7,0],[3,0],[0,0],[6,1],
        [2,3],[0,1],[4,0],[7,0],[9,1],[5,1],[1,2,18],
        [1,3,19]
      ],
      steps: [
        "Lay L across columns 4–6, with its hook raised on the right.",
        "Place S flat directly over the L.",
        "Lay J against the right wall, with its hook raised on the left.",
        "Place Z over the J near the right wall.",
        "Lay T flat above the L and S foundation.",
        "Set O in the bottom-left corner.",
        "Stand I vertically in column 7 to finish the first-bag DT foundation.",
        "Start bag 2 by turning L counter-clockwise and placing it over the centre-left tower.",
        "Stand J against the left wall to build the TSD roof.",
        "Place Z flat across columns 5–7.",
        "Set O across columns 8–9.",
        "Stand I vertically in column 10.",
        "Stand S across columns 6–7 to close the upper shelf.",
        "Turn T upside down and kick it into the left cavity for the T-Spin Double.",
        "Use the next bag's T vertically in the revealed cavity for the T-Spin Triple."
      ]
    },
    pco: {
      variant: "Perfect Clear Opener · fixed first-bag form",
      verified: true,
      sequence: "ILOJSTZ",
      plan: [[6,1,18],[7,0,20],[7,0,19],[7,2,17],[1,0,20],[0,1,19],[0,0,18]],
      steps: [
        "Stand I in column 7; this keeps the entire setup inside four rows.",
        "Lay L along the bottom-right edge.",
        "Set O directly above the L foot.",
        "Turn J upside down across the top-right shelf.",
        "Lay S across columns 2–4 on the floor.",
        "Stand T against the left wall to shape the compact side.",
        "Lay Z across the top-left. The first-bag PCO rectangle is ready for a second-bag solve."
      ]
    },
    dpc: {
      variant: "DPC prerequisite · extra-piece orientation drill",
      verified: true,
      sequence: "ILOJSTZ",
      plan: [[6,1,18],[7,0,20],[7,0,19],[7,2,17],[1,0,20],[0,1,19],[0,0,18]],
      steps: [
        "DPC begins after an 8-height perfect clear; this short drill first teaches the compact four-row base.",
        "Lay L on the right without increasing the four-row ceiling.",
        "Nest O over the L foot.",
        "Turn J across the upper-right edge.",
        "Keep S low on the left.",
        "Stand T at the wall; in a real DPC cycle the leftover piece determines which branch follows.",
        "Close the base with Z. This is the orientation prerequisite, not a claim that one fixed DPC solve covers every leftover piece."
      ]
    },
    gamushiro: {
      variant: "Gamushiro · fixed first-bag foundation",
      verified: true,
      sequence: "IJOLSTZ",
      plan: [[7,1,18],[0,0,20],[8,0,20],[8,1,17],[0,1,18],[5,3,19],[3,0,20]],
      steps: [
        "Stand I in column 8.", "Lay J in the bottom-left corner.", "Set O against the right wall.",
        "Stand L over I and O at the right edge.", "Stand S on the left to form the rising side.",
        "Turn T counter-clockwise beside the I column.", "Lay Z in the centre to finish the fixed Gamushiro first bag."
      ]
    },
    hachispin: {
      variant: "Hachispin · fixed TSS foundation",
      verified: true,
      sequence: "ILJOSTZ",
      plan: [[0,1,18],[1,2,19],[2,2,18],[5,0,20],[7,0,20],[6,2,18],[5,1,17]],
      steps: [
        "Stand I at the left wall.", "Turn L upside down along the lower-left shelf.",
        "Turn J upside down above the L.", "Set O in the centre.", "Lay S on the right.",
        "Turn T upside down across the right-centre shelf.", "Stand Z above the centre to finish the recognizable Hachispin first bag."
      ]
    },
    mko: {
      variant: "MKO · fixed TSD route",
      verified: true,
      sequence: "IJLOSZT",
      plan: [[9,1,16],[0,0,18],[4,0,18],[7,0,18],[0,1,16],[5,1,16],[2,2,17]],
      steps: [
        "Stand I at the right wall.", "Lay J in the bottom-left.", "Lay L across the centre.",
        "Set O beside L.", "Stand S at the left wall.", "Stand Z above L to make the overhang.",
        "Turn T upside down and rotate it into the centre-left cavity for the T-Spin Double."
      ]
    },
    albatross: {
      variant: "Albatross Special · fixed TSD route",
      verified: true,
      sequence: "IJLOSZT",
      plan: [[9,1,16],[6,2,16],[5,2,17],[3,0,18],[0,1,17],[3,0,16],[1,2,16]],
      steps: [
        "Stand I at the right wall.", "Turn J upside down across the upper-right.",
        "Turn L upside down beneath J.", "Set O in the centre-left.", "Stand S at the left wall.",
        "Lay Z over O to form the Albatross overhang.", "Turn T upside down into the left cavity for the T-Spin Double."
      ]
    },
    "st-stack": {
      variant: "ST/LST notch-spacing foundation",
      verified: true,
      sequence: "IJLOTZS",
      plan: [[9,1,15],[3,3,17],[0,1,17],[5,0,18],[7,0,18],[7,1,16],[5,0,16]],
      steps: [
        "Stand I at the right wall to mark the outside lane.", "Stand J in the centre-left.",
        "Stand L at the left wall.", "Set O between J and the right lane.", "Lay T on the lower-right shelf.",
        "Stand Z above the T side.", "Lay S across the centre. Notice the two-row notch spacing used by repeating ST-family stacks."
      ]
    },
    "6-3": {
      variant: "6–3 clean-stacking first bag",
      verified: true,
      sequence: "IJLOSTZ",
      plan: [[0,0,20],[0,0,19],[7,0,20],[4,0,20],[0,1,17],[2,2,18],[1,0,17]],
      steps: [
        "Lay I across the six-column side.", "Lay J above its left end.",
        "Put L on the three-column side; keep column 7 open as the separating well.", "Set O at the right edge of the six-column side.",
        "Stand S along the left wall.", "Turn T upside down across the centre-left.",
        "Lay Z over the T. The bag stays hole-free while preserving the 6–3 split."
      ]
    }
  };
});
