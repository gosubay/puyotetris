(function (root, factory) {
  const openers = factory();
  if (typeof module === "object" && module.exports) module.exports = openers;
  if (root) root.StackLabOpeners = openers;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  return {
    tki: {
      variant: "TKI-3 · standard first bag",
      verified: true,
      sequence: "ILZSOJT",
      plan: [[3,0],[0,1],[3,0],[6,1],[8,0],[3,2],[1,2,19]],
      steps: [
        "Lay I flat across columns 4–7.",
        "Stand L against the left wall, with its foot pointing right.",
        "Place Z across columns 4–6 on top of the I.",
        "Stand S in columns 7–8 to shape the right side.",
        "Set O against the right wall.",
        "Lay J across columns 4–6, with its hook down on the right.",
        "Turn T upside down and kick it into the left cavity. The normal landing ghost will stay above it until the spin succeeds."
      ]
    },
    "dt-cannon": {
      variant: "DT Cannon · first-bag foundation",
      verified: true,
      sequence: "LSJZTOI",
      plan: [[3,0],[3,0],[7,0],[7,0],[3,0],[0,0],[6,1]],
      steps: [
        "Lay L across columns 4–6, with its hook raised on the right.",
        "Place S flat directly over the L.",
        "Lay J against the right wall, with its hook raised on the left.",
        "Place Z over the J near the right wall.",
        "Lay T flat above the L and S foundation.",
        "Set O in the bottom-left corner.",
        "Stand I vertically in column 7 to finish the first-bag DT foundation."
      ]
    }
  };
});
