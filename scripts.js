const userCardTemplate = document.querySelector("[data-user-card]");
const userCardContainer = document.querySelector("[data-user-cards-container]");
const searchInput = document.querySelector("[data-search]");
const genderFilter = document.querySelector("[data-gender-filter]");
const loader = document.querySelector("[loader]");

const people = new Promise((resolve, reject) => {
  fetch("https://randomuser.me/api/?results=1000")
    .then((res) => res.json())
    .then((data) => {
      const paginatedList = splitArray(data.results, 15);
      const currentLoaded = 0;
      let loadedList = [];
      createUserCards(paginatedList[currentLoaded], currentLoaded);
      loadedList = [...loadedList, ...paginatedList[currentLoaded]];
      lastCardObserver.observe(document.querySelector(".card:last-child"));
      resolve({ paginatedList, currentLoaded, loadedList });
    })
    .catch((err) => reject(err))
    .finally(() => {
      loader.style.display = "none";
    });
});

// Animation Observer to add a "show" class to items on screen
const animationObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("show", entry.isIntersecting);
    });
  },
  {
    threshold: 0.5,
  }
);

// Lazy loader observer
const lastCardObserver = new IntersectionObserver((entries) => {
  const lastCard = entries[0];
  if (!lastCard.isIntersecting) return;
  loadNewCards();
  lastCardObserver.unobserve(lastCard.target);
  lastCardObserver.observe(document.querySelector(".card:last-child"));
});

function loadNewCards() {
  people.then((data) => {
    data.currentLoaded += 1;
    if (data.currentLoaded >= data.paginatedList.length) {
      lastCardObserver.unobserve(document.querySelector(".card:last-child"));
      return console.log("End of list");
    }
    data.loadedList = [
      ...data.loadedList,
      ...data.paginatedList[data.currentLoaded],
    ];
    createUserCards(data.paginatedList[data.currentLoaded], data.currentLoaded);
  });
}

function createUserCards(people, arrIdx) {
  return people.map((person, idx) => {
    // Create card from HTML template
    const card = userCardTemplate.content.cloneNode(true).children[0];

    // Get elements from card
    const name = card.querySelector("[data-name]");
    const details = card.querySelector("[data-details]");
    // Add card data
    cardIdx = document.createAttribute("data-id");

    // since I am creating arrays 15 at a time,
    // I need to multiply 15 by the current array I am creating
    // so that each ID remains unique
    cardIdx.value = arrIdx * 15 + idx;
    card.setAttributeNode(cardIdx);
    card.style.background = `linear-gradient(0deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.1)), url(${person.picture.large})`;
    name.textContent = `${person.name.title} ${person.name.first} ${person.name.last}`;
    details.textContent = `${person.dob.age}, ${person.gender}`;
    // Add card to DOM
    userCardContainer.append(card);
    // Start observing for animation
    animationObserver.observe(card);
  });
}

// This is used on my people array,
// to split it up so I can lazyload elements,
// instead of trying to load them all at once
function splitArray(arr, len) {
  const chunks = [];
  while (arr.length > 0) {
    chunks.push(arr.splice(0, len));
  }
  return chunks;
}

searchInput.addEventListener("input", (e) => {
  const value = e.target.value.toLowerCase();
  return people.then((people) => {
    people.loadedList.forEach((person, index) => {
      const isVisible =
        person.name.first.toLowerCase().includes(value) ||
        person.name.last.toLowerCase().includes(value);
      document
        .querySelector(`[data-id="${index}"]`)
        .classList.toggle("hide", !isVisible);
    });
  });
});

genderFilter.addEventListener("change", (e) => {
  const gender = e.target.value;
  if (!gender)
    return document
      .querySelectorAll("[data-id]")
      .forEach((el) => el.classList.remove("hide"));
  return people.then((people) => {
    people.loadedList.forEach((person, index) => {
      const isVisible = person.gender == gender;
      document
        .querySelector(`[data-id="${index}"]`)
        .classList.toggle("hide", !isVisible);
    });
  });
});
