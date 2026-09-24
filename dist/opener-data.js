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
      variant: "Perfect Clear Opener · complete 4-line PC",
      verified: true,
      sequence: "ILOJSTZJTI",
      plan: [[6,1,18],[7,0,20],[7,0,19],[7,2,17],[1,0,20],[0,1,19],[0,0,18],[3,3,19],[2,2,17],[5,1,18]],
      steps: [
        "Stand I in column 7; this keeps the entire setup inside four rows.",
        "Lay L along the bottom-right edge.",
        "Set O directly above the L foot.",
        "Turn J upside down across the top-right shelf.",
        "Lay S across columns 2–4 on the floor.",
        "Stand T against the left wall to shape the compact side.",
        "Lay Z across the top-left to finish the first-bag PCO rectangle.",
        "Start bag 2 by standing J in the centre gap.",
        "Turn T upside down over J to close the left half.",
        "Stand I in column 6 to complete the four-line Perfect Clear."
      ]
    },
    dpc: {
      variant: "DPC · extra-T MKO branch · TSD → PC",
      verified: true,
      sequence: "ILOSZTJTILOSTZJ",
      plan: [[0,1,18],[6,0,20],[6,0,19],[8,1,18],[4,1,19],[1,0,20],[1,1,18],[2,2,18],[9,1,18],[6,0,18],[0,0,18],[2,1,18],[4,2,19],[3,0,19],[5,2,19]],
      steps: [
        "Stand the leftover I at the left wall for the extra-T MKO DPC branch.",
        "Lay L across the lower-right.",
        "Set O above the L foot.",
        "Stand S at the right wall.",
        "Stand Z in the centre to finish the DPC foundation.",
        "Lay T over the lower-left shelf.",
        "Stand J beside I with its foot pointing right.",
        "Turn the next T upside down into the cavity for the T-Spin Double.",
        "Stand I at the right wall to begin the Perfect Clear solve.",
        "Lay L across the upper-right shelf.",
        "Set O at the upper-left.",
        "Stand S in the left-centre channel.",
        "Turn T upside down across the lower middle.",
        "Lay Z into the centre opening.",
        "Turn J upside down to complete the four-line Perfect Clear."
      ]
    },
    gamushiro: {
      variant: "Gamushiro · full TST → TSD route",
      verified: true,
      sequence: "IJOLSTZIJLOSZTJISLZT",
      plan: [[7,1,18],[0,0,20],[8,0,20],[8,1,17],[0,1,18],[5,3,19],[3,0,20],[0,1,14],[1,1,16],[8,3,16],[8,0,14],[5,0,17],[3,0,18],[2,1,18],[3,2,18],[1,0,17],[5,1,17],[6,3,17],[3,1,19],[1,2,19]],
      steps: [
        "Stand I in column 8.", "Lay J in the bottom-left corner.", "Set O against the right wall.",
        "Stand L over I and O at the right edge.", "Stand S on the left to form the rising side.",
        "Turn T counter-clockwise beside the I column.", "Lay Z in the centre to finish the fixed Gamushiro first bag.",
        "Start bag 2 by standing I at the left wall.", "Stand J beside I.", "Stand L at the right wall.",
        "Set O above the right side.", "Lay S across the centre-right shelf.", "Lay Z across the centre.",
        "Turn T clockwise into the left cavity for the T-Spin Triple.",
        "Turn J upside down into the centre residue.", "Lay I across the upper-left.",
        "Stand S in the centre-right channel.", "Stand L on the right.", "Stand Z in the lower centre.",
        "Turn T upside down into the left cavity for the T-Spin Double."
      ]
    },
    hachispin: {
      variant: "Hachispin · fixed T-Spin Single",
      verified: true,
      sequence: "ILJOSZT",
      plan: [[0,1,18],[1,2,19],[2,2,18],[5,0,20],[7,0,20],[5,1,17],[6,2,18]],
      steps: [
        "Stand I at the left wall.", "Turn L upside down along the lower-left shelf.",
        "Turn J upside down above the L.", "Set O in the centre.", "Lay S on the right.",
        "Stand Z above the centre to close the overhang.",
        "Turn T upside down and rotate it into the right-side cavity for the T-Spin Single."
      ]
    },
    "t-spin-factory": {
      variant: "Mechanical TSD v2 · three-bag factory",
      verified: true,
      sequence: "TIJLOZSJZILOSTJZILOST",
      queue: "TSIJLOZTJZILOSTJZILOS",
      plan: [
        [0,2,19],[9,1,18],[0,1,17],[7,3,19],[6,0,20],[1,1,17],[4,0,19],
        [0,1,14],[1,1,14],[9,1,14],[7,3,16],[6,0,17],[4,0,16],[2,2,15],
        [0,1,13],[1,1,13],[9,1,12],[7,3,15],[6,0,16],[4,0,15],[2,2,14]
      ],
      steps: [
        "Turn T upside down at the far left. The early T starts the factory foundation.",
        "Hold the S, then stand I at the right wall.",
        "Stand J at the far left with its hook across the top.",
        "Turn L counter-clockwise beside the I column.",
        "Set O below the L on the right.",
        "Place Z vertically beside J first. Keep the green S in hold.",
        "When the next T appears, swap it for the saved S and hang S horizontally over O.",
        "Start the repeating cycle by standing J at the far left.",
        "Stand Z beside J to rebuild the same left tower.",
        "Stand I at the right wall for the factory's outside column.",
        "Turn L counter-clockwise beside the I column.",
        "Set O below L on the right.",
        "Hang S over O, repeating the same right-side structure.",
        "Turn T upside down and rotate it into the cavity for the first T-Spin Double.",
        "Repeat the cycle: stand J at the far left again.",
        "Stand Z beside J again; do not change the left tower at the higher level.",
        "Stand I one row higher at the right wall so the repeating factory remains legal.",
        "Turn L counter-clockwise beside the I column again.",
        "Set O below L again.",
        "Hang S over O again to finish the repeated right side.",
        "Use the held T and rotate it upside down into the cavity for the second T-Spin Double."
      ]
    },
    mko: {
      variant: "MKO · fixed TSD route",
      verified: true,
      sequence: "IJLOSZT",
      plan: [[9,1,18],[0,0,20],[4,0,20],[7,0,20],[0,1,18],[5,1,18],[2,2,19]],
      steps: [
        "Stand I at the right wall.", "Lay J in the bottom-left.", "Lay L across the centre.",
        "Set O beside L.", "Stand S at the left wall.", "Stand Z above L to make the overhang.",
        "Turn T upside down and rotate it into the centre-left cavity for the T-Spin Double."
      ]
    },
    albatross: {
      variant: "Albatross Special · fixed TSD route",
      verified: true,
      sequence: "ILJOSZT",
      plan: [[9,1,18],[5,2,19],[6,2,18],[3,0,20],[0,1,19],[3,0,18],[1,2,18]],
      steps: [
        "Stand I at the right wall.", "Turn L upside down across the lower-right.",
        "Turn J upside down above L.", "Set O in the centre-left.", "Stand S at the left wall.",
        "Lay Z over O to form the Albatross overhang.", "Turn T upside down into the left cavity for the T-Spin Double."
      ]
    },
    "st-stack": {
      variant: "T-base LST notch-spacing foundation",
      verified: true,
      sequence: "JLOTIZS",
      plan: [[3,3,19],[0,1,19],[5,0,20],[7,0,20],[9,1,17],[7,1,18],[5,0,18]],
      steps: [
        "Stand J in the centre-left.", "Stand L at the left wall.",
        "Set O between J and the right lane.", "Lay T on the lower-right shelf.",
        "Stand I at the right wall to mark the outside lane.", "Stand Z above the T side.",
        "Lay S across the centre. This is the T-base LST foundation; it is no longer mislabeled as ordinary ST Stacking."
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
