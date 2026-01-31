// 🔥 FIREBASE CONFIG (REPLACE WITH YOUR REAL CONFIG)
var firebaseConfig = {
  apiKey: "AIzaSyCLhd-t8akP6u1xhguCj7K6RmS3dMf_5Gs",
  authDomain: "sameer-dange-sports-turf.firebaseapp.com",
  projectId: "sameer-dange-sports-turf",
};
firebase.initializeApp(firebaseConfig);

var db = firebase.firestore();

// =========================
// BOOK TURF + PAYMENT FLOW
// =========================

function addBooking() {
  const name = document.getElementById("playerName").value.trim();
  const date = document.getElementById("bookingDate").value;
  const slot = document.getElementById("timeSlot").value;
  const amount = document.getElementById("advanceAmount").value;

  if (!name || !date || !slot || !amount) {
    alert("Please fill all details");
    return;
  }

 // 🔗 UPI DEEP LINK
  var upiId = "Q225317273@ybl";
var payeeName = "Dange Sports Turf";
var amountNum = Number(amount);

if (isNaN(amountNum) || amountNum <= 0) {
  alert("Invalid amount");
  return;
}

var transactionNote = "Turf Booking Advance";
var transactionRef = "TURF" + Date.now();

var upiLink =
  "intent://pay?" +
  "pa=" + encodeURIComponent(upiId) +
  "&pn=" + encodeURIComponent(payeeName) +
  "&am=" + amountNum +
  "&cu=INR" +
  "&tn=" + encodeURIComponent(transactionNote) +
  "&tr=" + transactionRef +
  "#Intent;scheme=upi;end";

window.location.href = upiLink;

  // 🔥 Check if slot already booked
  db.collection("bookings")
    .where("date", "==", date)
    .where("slot", "==", slot)
    .get()
    .then(snapshot => {
      if (!snapshot.empty) {
        alert("❌ This slot is already booked!");
        return;
      }

      // 👉 Redirect to UPI App
      window.location.href = upiLink;

      // ⏳ After payment confirmation
      setTimeout(() => {
        const confirmPay = confirm(
          "Have you completed the UPI payment?"
        );

        if (confirmPay) {
          saveBooking(name, date, slot, amount);
        }
      }, 4000);
    });
}

// =================
// SAVE BOOKING
// =================
function saveBooking(name, date, slot, amount) {
  db.collection("bookings").add({
    name: name,
    date: date,
    slot: slot,
    amount: amount,
    paymentStatus: "PAID",
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(() => {
    alert("✅ Booking Successful!");
    loadBookings();
  })
  .catch(err => {
    alert("Error saving booking");
    console.error(err);
  });
}

// =================
// LOAD BOOKINGS
// =================
function loadBookings() {
  const list = document.getElementById("list");
  const todayList = document.getElementById("todayList");
  const filterDate = document.getElementById("filterDate").value;

  list.innerHTML = "";
  todayList.innerHTML = "";

  const today = new Date().toISOString().split("T")[0];

  let query = db.collection("bookings").orderBy("timestamp", "desc");

  if (filterDate) {
    query = query.where("date", "==", filterDate);
  }

  query.onSnapshot(snapshot => {
    list.innerHTML = "";
    todayList.innerHTML = "";

    snapshot.forEach(doc => {
      const b = doc.data();

      const item = `
        <div class="booking">
          <b>${b.name}</b><br>
          ${b.date} | ${b.slot}<br>
          ₹${b.amount} - ${b.paymentStatus}
        </div>
      `;

      list.innerHTML += item;

      if (b.date === today) {
        todayList.innerHTML += item;
      }
    });
  });
}