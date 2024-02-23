import { useEffect, useState } from "react";
import "./TableList.css";

// The TableList component is designed to display a list of content in a tabular format,
// with features for sorting, filtering, and pagination.

export default function TableList({ content, objectKey }) {
  // formattedContent stores the content formatted for display.
  const [formattedContent, setFormattedContent] = useState(null);
  // filteredContent stores content filtered according to user search criteria.
  const [filteredContent, setFilteredContent] = useState(null);
  // separatedContent divides the filtered content into pages based on desired rows per page.
  const [separatedContent, setSeparatedContent] = useState(null);
  // categories stores the categories (columns) of the table.
  const [categories, setCategories] = useState([]);
  // sorting stores the sorting state for each category.
  const [sorting, setSorting] = useState({});
  // rowsDisplayed determines the number of rows to display per page.
  const [rowsDisplayed, setRowsDisplayed] = useState(10);
  // currentPage stores the currently displayed page.
  const [currentPage, setCurrentPage] = useState(0);

  // Initializes categories and formats content on component mount
  // or when content or objectKey changes.
  useEffect(() => {
    // Defines categories and prepares data for initial sorting.
    const defineCategories = (content) => {
      const tempCategories = [];
      const formattedCategories = [];
      const initSorting = {};

      content.forEach((object) => {
        for (let property in object) {
          if (!tempCategories.includes(property)) {
            tempCategories.push(property);
          }
        }
      });

      tempCategories.forEach((category) => {
        let formattedCategory = category;
        for (const letter of category) {
          if (letter === letter.toUpperCase()) {
            formattedCategory = category.replace(
              letter,
              ` ${letter.toLowerCase()}`
            );
          }
        }
        formattedCategory = formattedCategory.replace(
          formattedCategory[0],
          formattedCategory[0].toUpperCase()
        );
        formattedCategories.push({
          category: category,
          formattedCategory: formattedCategory,
        });
        initSorting[category] = "none";
      });

      setCategories(formattedCategories);
      setSorting(initSorting);
    };
    // Adjusts content based on the provided objectKey.
    const removeObjects = (content) => {
      let tempContent = [];

      content.forEach((object) => {
        const newObject = {};
        for (const property in object) {
          if (objectKey.hasOwnProperty(property)) {
            const replacementProperty = objectKey[property];
            newObject[property] = object[property][replacementProperty];
          } else {
            newObject[property] = object[property];
          }
        }
        tempContent.push(newObject);
      });
      setFormattedContent(tempContent);
    };

    defineCategories(content);
    removeObjects(content);
  }, [content, objectKey]);

  // Updates filteredContent whenever formattedContent changes.
  useEffect(() => {
    setFilteredContent(formattedContent);
  }, [formattedContent]);

  // Function to sort content based on a specified category and order.
  const sortContent = (content, category, toggleOrder = false) => {
    if (toggleOrder) {
      toggleSortOrder(category);
    }
    return [...content].sort((a, b) => {
      let aValue = a[category];
      let bValue = b[category];

      if (aValue && bValue && /\d{2}\/\d{2}\/\d{4}/.test(aValue)) {
        const [dayA, monthA, yearA] = aValue.split("/");
        const [dayB, monthB, yearB] = bValue.split("/");
        aValue = new Date(`${yearA}-${monthA}-${dayA}`);
        bValue = new Date(`${yearB}-${monthB}-${dayB}`);
      }
      if (sorting[category] === "ascending") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };
  // Toggles the sorting order for a given category.
  const toggleSortOrder = (category) => {
    const newOrder =
      sorting[category] === "ascending" ? "descending" : "ascending";
    setSorting({ ...sorting, [category]: newOrder });
  };

  // Filters content based on a search query.
  const filterContent = (query, content) => {
    const newContent = content.filter((row) => {
      let rowValues = Object.values(row);
      rowValues = rowValues.map((value) =>
        value.toLowerCase().includes(query.toLowerCase())
      );
      return rowValues.includes(true);
    });

    for (const category in sorting) {
      if (sorting[category] !== "none") {
        return sortContent(newContent, category, false);
      }
    }

    return newContent;
  };

  // Splits the filtered content into multiple pages.
  useEffect(() => {
    const separatePages = (content) => {
      let originalContent = [...content];
      let slices = [];
      while (originalContent.length > 0) {
        slices.push(originalContent.slice(0, rowsDisplayed));
        originalContent = originalContent.slice(rowsDisplayed);
      }
      setSeparatedContent(slices);
    };

    if (filteredContent) {
      setCurrentPage(0);
      separatePages(filteredContent);
    }
  }, [rowsDisplayed, filteredContent]);

  // Renders a specific property of a row, with formatting if necessary.
  const renderProperty = (row, category) => {
    const value = row[category.category] || "N/A";
    if (
      value &&
      !isNaN(new Date(value)) &&
      new Date(value).toISOString() === value
    ) {
      const dateOptions = { year: "numeric", month: "2-digit", day: "2-digit" };
      const formattedDate = new Intl.DateTimeFormat(
        "fr-FR",
        dateOptions
      ).format(new Date(value));
      return formattedDate;
    }
    return value;
  };
  // Component structure, including display management, search, and pagination.
  return (
    <div className="container">
      <header className="tableHeader">
        <label htmlFor="tableSeparate" className="searchBar">
          Show
          <select
            id="tableSeparate"
            name="tableSeparate"
            value={rowsDisplayed}
            className="entries"
            onChange={(event) => setRowsDisplayed(event.target.value)}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          entries
        </label>
        <form className="searchBar">
          <label htmlFor="tableSearch">Search: </label>
          <input
            id="tableSearch"
            name="tableSearch"
            className="inputContent"
            onChange={(event) => {
              setFilteredContent(
                filterContent(event.target.value, formattedContent)
              );
            }}
          ></input>
        </form>
      </header>
      <div className="tableContentList">
        <table className="list">
          <thead>
            <tr className="listHead">
              {categories.map((category) => (
                <th key={category.category}>
                  <button
                    className="listSort"
                    onClick={() => {
                      setFilteredContent(
                        sortContent(filteredContent, category.category, true)
                      );
                      toggleSortOrder(category.category);
                    }}
                  >
                    <h2>{category.formattedCategory}</h2>
                    <div className="iconSort">
                      {sorting[category.category] !== "ascending" ? (
                        <svg
                          className="orderIcon"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M7 14L12 9L17 14H7Z" fill="currentColor" />
                        </svg>
                      ) : (
                        <svg
                          className="orderIcon iconHidden"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M7 14L12 9L17 14H7Z" fill="currentColor" />
                        </svg>
                      )}
                      {sorting[category.category] !== "descending" ? (
                        <svg
                          className="orderIcon"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M7 10L12 15L17 10H7Z" fill="currentColor" />
                        </svg>
                      ) : (
                        <svg
                          className="orderIcon iconHidden"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M7 10L12 15L17 10H7Z" fill="currentColor" />
                        </svg>
                      )}
                    </div>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {separatedContent && separatedContent.length > 0 ? (
              separatedContent[currentPage].map((row, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "tableRowEven" : "tableRowOdd"}
                >
                  {categories.map((category) => (
                    <td key={category.category} className="cell">
                      {renderProperty(row, category)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="error" colSpan={categories.length}>
                  No result matches your search!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <footer className="footerContent">
        {separatedContent && separatedContent.length > 0 && (
          <p className="showEntries">
            Showing{" "}
            {filteredContent.indexOf(
              separatedContent[currentPage][rowsDisplayed - 1]
            ) === -1
              ? filteredContent.length
              : filteredContent.indexOf(
                  separatedContent[currentPage][rowsDisplayed - 1]
                ) + 1}{" "}
            of {filteredContent.length} entries
          </p>
        )}
        {separatedContent && separatedContent.length > 0 && (
          <nav className="footerNav">
            {currentPage !== 0 && (
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                className="btnNav"
              >
                Previous
              </button>
            )}
            <p>
              Page {currentPage + 1} of {separatedContent.length}
            </p>
            {separatedContent &&
              currentPage !== separatedContent.length - 1 && (
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="btnNav"
                >
                  Next
                </button>
              )}
          </nav>
        )}
      </footer>
    </div>
  );
}
