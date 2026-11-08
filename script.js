/* =========================================================
   ADELE & OLIVER — Invitation settings
   Update the event details and Google Form IDs before publishing.
   ========================================================= */
const INVITATION = {
  firstName: "ARMAND",
  secondName: "FEMME",
  dateLabel: "????",
  timeLabel: "?? h ?? – ?? h ??",
  venue: "MAIRIE DE COCODY",
  address: "ABIDJAN, CÔTE D’IVOIRE",
  mapsUrl: "",
  rsvpDeadline: "MERCI DE NOUS CONFIRMER VOTRE RÉPONSE",
  googleFormEndpoint: "https://docs.google.com/forms/d/e/1FAIpQLScQmabZZAyIRHWHd_QJAQVrXDd3xqL4AWgcdqG8jBObHfOqaw/formResponse",
  googleFormEntries: {
    guestName: "entry.1925822244",
    phone: "entry.1692144974",
    attendance: "entry.2133937667"
  }
};

const experience = document.getElementById("experience");
const openEnvelope = document.getElementById("openEnvelope");
const envelopeScene = document.getElementById("envelopeScene");
const invitationPaper = document.getElementById("invitationPaper");
const cardBack = document.getElementById("cardBack");
const pages = [...document.querySelectorAll(".invitation-page")];
const prevButton = document.getElementById("prevPage");
const nextButton = document.getElementById("nextPage");
const controls = document.getElementById("paperControls");
const pageProgress = document.getElementById("pageProgress");
const rsvpForm = document.getElementById("rsvpForm");
const googleFormFrame = document.getElementById("googleFormFrame");
const submitButton = document.getElementById("submitRsvp");
const formSuccess = document.getElementById("formSuccess");
const formError = document.getElementById("formError");
const formNote = document.getElementById("formNote");

let currentPage = 0;
let rsvpSubmitted = false;
let rsvpSubmitting = false;

function applyInvitationSettings() {
  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };

  setText("eventDateText", INVITATION.dateLabel);
  setText("welcomeDateText", INVITATION.dateLabel);
  setText("backDateText", INVITATION.dateLabel);
  setText("eventTimeText", INVITATION.timeLabel);
  setText("venueText", INVITATION.venue);
  setText("locationVenueText", INVITATION.venue);
  setText("addressText", INVITATION.address);
  setText("rsvpDeadline", INVITATION.rsvpDeadline);
  setText("backName1", INVITATION.firstName);
  setText("backName2", INVITATION.secondName);

  const name1 = document.querySelector(".name-first");
  const name2 = document.querySelector(".name-second");
  if (name1) name1.textContent = INVITATION.firstName;
  if (name2) name2.textContent = INVITATION.secondName;

  const mapQuery = `${INVITATION.venue}, ${INVITATION.address}`;
  const directions = document.getElementById("directionsLink");
  if (directions) {
    directions.href = INVITATION.mapsUrl ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;
  }
  const map = document.getElementById("locationMap");
  if (map) {
    map.src = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;
  }

  document.title = `${INVITATION.firstName} & ${INVITATION.secondName} — Invitation de mariage`;
  formNote.textContent = "Votre réponse sera envoyée à votre Google Form et ajoutée à la feuille qui lui est associée.";
}

function showPage(index) {
  currentPage = Math.max(0, Math.min(pages.length - 1, index));
  pages.forEach((page, pageIndex) => {
    const active = pageIndex === currentPage;
    page.classList.toggle("is-active", active);
    page.setAttribute("aria-hidden", String(!active));
  });
  pageProgress.textContent = `${currentPage + 1} / 5`;
  prevButton.disabled = currentPage === 0;
  nextButton.disabled = rsvpSubmitting;
  nextButton.innerHTML = currentPage === pages.length - 1
    ? "VOIR LA PAGE FINALE <span aria-hidden=\"true\">›</span>"
    : "SUIVANT <span aria-hidden=\"true\">›</span>";
  controls.classList.add("ready");
}

function showBack() {
  if (!rsvpSubmitted) {
    showFormError("Merci de confirmer votre présence ou votre absence avant de continuer.");
    showPage(pages.length - 1);
    document.getElementById("guestName").focus();
    return;
  }
  invitationPaper.setAttribute("aria-hidden", "true");
  cardBack.setAttribute("aria-hidden", "false");
  experience.classList.add("show-back");
  controls.classList.remove("ready");
}

function returnToFront() {
  experience.classList.remove("show-back");
  invitationPaper.setAttribute("aria-hidden", "false");
  cardBack.setAttribute("aria-hidden", "true");
  showPage(pages.length - 1);
}

function nextPage() {
  if (currentPage === pages.length - 1) {
    showBack();
    return;
  }
  showPage(currentPage + 1);
}

function showFormError(message) {
  formError.textContent = message;
  formError.hidden = false;
  formSuccess.hidden = true;
}

function clearFormMessages() {
  formError.hidden = true;
  formSuccess.hidden = true;
}

function validatePhone() {
  const phoneInput = document.getElementById("guestPhone");
  const digitCount = phoneInput.value.replace(/\D/g, "").length;
  phoneInput.setCustomValidity(digitCount >= 10 ? "" : "Saisissez au minimum 10 chiffres.");
}

function isGoogleFormEndpoint(endpoint) {
  try {
    const url = new URL(endpoint);
    return url.protocol === "https:" &&
      url.hostname === "docs.google.com" &&
      /^\/forms\/d\/e\/[^/]+\/formResponse\/?$/.test(url.pathname);
  } catch {
    return false;
  }
}

function sendRsvpToGoogleForm(response) {
  return new Promise((resolve, reject) => {
    let completed = false;
    const cleanup = timeout => {
      window.clearTimeout(timeout);
      googleFormFrame.removeEventListener("load", handleLoad);
    };
    const timeout = window.setTimeout(() => {
      if (completed) return;
      completed = true;
      cleanup(timeout);
      reject(new Error("Google Forms n’a pas répondu dans le délai prévu."));
    }, 30000);
    const handleLoad = () => {
      if (completed) return;
      completed = true;
      cleanup(timeout);
      resolve();
    };

    const postForm = document.createElement("form");
    postForm.method = "POST";
    postForm.action = INVITATION.googleFormEndpoint;
    postForm.target = googleFormFrame.name;
    postForm.hidden = true;

    const fields = {
      [INVITATION.googleFormEntries.guestName]: response.guestName,
      [INVITATION.googleFormEntries.phone]: response.phone,
      [INVITATION.googleFormEntries.attendance]: response.attendance === "present"
        ? "Oui je serais present !"
        : "Non je serais pas present !",
      "entry.2133937667_sentinel": "",
      fvv: "1",
      pageHistory: "0"
    };
    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = String(value);
      postForm.append(input);
    });

    googleFormFrame.addEventListener("load", handleLoad);
    document.body.append(postForm);
    try {
      postForm.submit();
    } catch (error) {
      if (!completed) {
        completed = true;
        cleanup(timeout);
      }
      postForm.remove();
      reject(error);
      return;
    }
    window.setTimeout(() => postForm.remove(), 1000);
  });
}

openEnvelope.addEventListener("click", () => {
  if (experience.classList.contains("is-open")) return;
  const revealInvitation = event => {
    if (event.target !== envelopeScene || event.propertyName !== "opacity") return;
    envelopeScene.removeEventListener("transitionend", revealInvitation);
    invitationPaper.setAttribute("aria-hidden", "false");
    showPage(0);
  };
  envelopeScene.addEventListener("transitionend", revealInvitation);
  envelopeScene.setAttribute("aria-hidden", "true");
  experience.classList.add("is-open");
  openEnvelope.disabled = true;
});

prevButton.addEventListener("click", () => showPage(currentPage - 1));
nextButton.addEventListener("click", nextPage);
document.getElementById("returnToFront").addEventListener("click", returnToFront);

rsvpForm.addEventListener("input", clearFormMessages);
rsvpForm.addEventListener("change", clearFormMessages);
rsvpForm.addEventListener("input", event => {
  if (event.target.id === "guestPhone") validatePhone();
});
rsvpForm.addEventListener("submit", async event => {
  event.preventDefault();
  if (rsvpSubmitting || rsvpSubmitted) return;
  validatePhone();
  if (!rsvpForm.reportValidity()) return;

  if (!isGoogleFormEndpoint(INVITATION.googleFormEndpoint)) {
    showFormError("L’adresse de votre Google Form semble invalide. Vérifiez la configuration dans script.js.");
    return;
  }

  const formData = new FormData(rsvpForm);
  const response = {
    guestName: String(formData.get("guestName") || "").trim(),
    phone: String(formData.get("phone") || "").replace(/\D/g, ""),
    attendance: String(formData.get("attendance") || ""),
    guestCount: 1,
    submittedAt: new Date().toISOString()
  };
  if (!response.guestName || !response.phone || !response.attendance) {
    showFormError("Merci de remplir tous les champs obligatoires.");
    return;
  }

  rsvpSubmitting = true;
  submitButton.disabled = true;
  submitButton.textContent = "ENVOI EN COURS…";
  nextButton.disabled = true;
  clearFormMessages();

  try {
    await sendRsvpToGoogleForm(response);

    rsvpSubmitted = true;
    formSuccess.textContent = response.attendance === "present"
      ? "Merci — votre présence est confirmée. Nous avons hâte de célébrer avec vous."
      : "Merci de nous avoir prévenus. Votre réponse a bien été transmise aux mariés.";
    formSuccess.hidden = false;
    submitButton.textContent = "RÉPONSE ENREGISTRÉE";
    rsvpForm.querySelectorAll("input").forEach(input => { input.disabled = true; });
  } catch (error) {
    console.error("Échec de l’envoi du RSVP à Google Forms :", error);
    showFormError("Votre réponse n’a pas pu être envoyée à Google Forms. Vérifiez votre connexion et réessayez.");
    submitButton.disabled = false;
    submitButton.textContent = "CONFIRMER MA PRÉSENCE";
  } finally {
    rsvpSubmitting = false;
    nextButton.disabled = false;
  }
});

document.addEventListener("keydown", event => {
  if (!experience.classList.contains("is-open")) return;
  if (event.key === "Escape" && experience.classList.contains("show-back")) {
    returnToFront();
    return;
  }
  if (experience.classList.contains("show-back")) return;

  const target = event.target;
  if (target instanceof HTMLElement && (
    target.isContentEditable || ["INPUT", "BUTTON", "SELECT", "TEXTAREA"].includes(target.tagName)
  )) return;
  if (event.key === "ArrowRight") nextPage();
  if (event.key === "ArrowLeft" && currentPage > 0) showPage(currentPage - 1);
});

applyInvitationSettings();
