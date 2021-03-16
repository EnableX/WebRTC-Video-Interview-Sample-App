// function enterRoomByToken() {
//   var referral = document.referrer;
//   // if (
//   //   referral.includes("cc-shivam.vcloudx.com") ||
//   //   referral.includes("vc-vinod.vcloudx.com")
//   // ) {
//   if (referral) {
//     const token = JWT.sign(
//       {
//         data: {
//           agent: "Shivam",
//           agent_id: Math.floor(Math.random() * Math.floor(999999)),
//           stall: "Pantaloon",
//           stall_id: "6628631",
//           room_id: "5ecf969cf1f87b19b1cc3c94",
//           license: "av",
//           expiry: null,
//         },
//       },
//       "secret",
//       { expiresIn: 60 * 60 }
//     );
//     window.location.href = `/session?token=${token}`;
//   } else {
//     alert("referral check failed ");
//   }
// }
window.onload = function () {
  // enterRoomByToken();
};
