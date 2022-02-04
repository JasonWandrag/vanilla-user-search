const userCardTemplate = document.querySelector("[data-user-card]");
const userCardContainer = document.querySelector("[data-user-cards-container]");
const searchInput = document.querySelector("[data-search]");
const genderFilter = document.querySelector("[data-gender-filter]");
const errorContainer = document.querySelector("[data-error]");
const loader = document.querySelector("[loader]");

const people = new Promise((resolve, reject) => {
  fetch("https://randomuser.me/api/?results=1000")
    .then((res) => res.json())
    .then((data) => {
      // The array is split for lazy loading
      const paginatedList = splitArray(data.results, 15);

      // Select which array is loaded
      const currentLoaded = 0;

      // I created this array so I can search/filter everyone who has been loaded to the screen
      let loadedList = [];
      loadedList = [...loadedList, ...paginatedList[currentLoaded]];

      createUserCards(paginatedList[currentLoaded]);

      // Start observing last card created for lazy loading next data
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

  // If card is not on screen, dont do anything
  if (!lastCard.isIntersecting) return;

  // This is where I load new cards to the DOM
  people.then((data) => {
    // Update which chunked array is loaded
    data.currentLoaded += 1;

    // I need this to check if the last array has been loaded
    // If it has, then stop observing for increased page performance
    if (data.currentLoaded >= data.paginatedList.length) {
      lastCardObserver.unobserve(document.querySelector(".card:last-child"));
      return (errorContainer.textContent = "End of list");
    }

    // Update this list, for search/filtering to include new cards being loaded
    data.loadedList = [
      ...data.loadedList,
      ...data.paginatedList[data.currentLoaded],
    ];

    createUserCards(data.paginatedList[data.currentLoaded]);
  });

  // Since the old card is no longer the last card, unobserve the current card and observe new last card
  lastCardObserver.unobserve(lastCard.target);
  lastCardObserver.observe(document.querySelector(".card:last-child"));
});

function createUserCards(people) {
  return people.map((person) => {
    // Create card from HTML template
    const card = userCardTemplate.content.cloneNode(true).children[0];

    // Get elements from card
    const name = card.querySelector("[data-name]");
    const details = card.querySelector("[data-details]");
    // Add card data
    cardIdx = document.createAttribute("data-id");
    cardIdx.value = person.login.uuid;
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
  return people
    .then((people) => {
      foundPeople = people.loadedList.filter((person) => {
        return (
          person.name.first.toLowerCase().includes(value) ||
          person.name.last.toLowerCase().includes(value)
        );
      });

      people.loadedList.forEach((person) => {
        const isVisible = foundPeople.some(
          (p) => p.login.uuid === person.login.uuid
        );
        document
          .querySelector(`[data-id="${person.login.uuid}"]`)
          .classList.toggle("hide", !isVisible);
      });
      if (foundPeople.length == 0) {
        throw new Error("No people by that name found");
      } else {
        errorContainer.textContent = "";
      }
    })
    .catch((err) => {
      errorContainer.textContent = err;
    });
});

genderFilter.addEventListener("change", (e) => {
  const gender = e.target.value;
  if (!gender)
    return document
      .querySelectorAll("[data-id]")
      .forEach((el) => el.classList.remove("hide"));
  return people.then((people) => {
    people.loadedList.forEach((person) => {
      const isVisible = person.gender == gender;
      document
        .querySelector(`[data-id="${person.login.uuid}"]`)
        .classList.toggle("hide", !isVisible);
    });
  });
});
