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
    }
  };
});
