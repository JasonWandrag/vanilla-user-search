const userCardTemplate = document.querySelector("[data-user-card]");
const userCardContainer = document.querySelector("[data-user-cards-container]");
const searchInput = document.querySelector("[data-search]");
const genderFilter = document.querySelector("[data-gender-filter]");
const loader = document.querySelector("[loader]");

const people = new Promise((resolve, reject) => {
  fetch("https://randomuser.me/api/?results=1000")
    .then((res) => res.json())
    .then((data) => {
      createUserCards(data.results);
      resolve(data.results);
    })
    .catch((err) => reject(err))
    .finally(() => {
      loader.style.display = "none";
    });
});

// Animation Observer to add a "show" class to items on screen
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("show", entry.isIntersecting);
    });
  },
  {
    threshold: 0.5,
  }
);

function createUserCards(people) {
  return people.map((person, idx) => {
    // Create card from HTML template
    const card = userCardTemplate.content.cloneNode(true).children[0];

    // Get elements from card
    const name = card.querySelector("[data-name]");
    const details = card.querySelector("[data-details]");
    // Add card data
    cardIdx = document.createAttribute("data-id");
    cardIdx.value = idx;
    card.setAttributeNode(cardIdx);
    card.style.background = `linear-gradient(0deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.1)), url(${person.picture.large})`;
    name.textContent = `${person.name.title} ${person.name.first} ${person.name.last}`;
    details.textContent = `${person.dob.age}, ${person.gender}`;
    // Add card to DOM
    userCardContainer.append(card);
    // Start observing for animation
    observer.observe(card);
  });
}

// Search Functionality
searchInput.addEventListener("input", (e) => {
  const value = e.target.value.toLowerCase();
  return people.then((people) => {
    people.forEach((person, index) => {
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
    people.forEach((person, index) => {
      const isVisible = person.gender == gender;
      document
        .querySelector(`[data-id="${index}"]`)
        .classList.toggle("hide", !isVisible);
    });
  });
});
