import React from "react";
import { useEffect, useState } from "react";
import "./TableList.css";

export default function TableList({ content, objectKey }) {
  const [formattedContent, setFormattedContent] = useState(null);
  const [filteredContent, setFilteredContent] = useState(null);
  const [separatedContent, setSeparatedContent] = useState(null);
  const [categories, setCategories] = useState([]);
  const [sorting, setSorting] = useState({});
  const [rowsDisplayed, setRowsDisplayed] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
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

  useEffect(() => {
    setFilteredContent(formattedContent);
  }, [formattedContent]);

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

  const toggleSortOrder = (category) => {
    const newOrder =
      sorting[category] === "ascending" ? "descending" : "ascending";
    setSorting({ ...sorting, [category]: newOrder });
  };

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
                    <i
                      className={
                        sorting[category.category] !== "ascending"
                          ? "orderIcon fa-solid fa-sort-up"
                          : "orderIcon fa-solid fa-sort-up iconHidden"
                      }
                    ></i>
                    <i
                      className={
                        sorting[category.category] !== "descending"
                          ? "orderIcon fa-solid fa-sort-down"
                          : "orderIcon fa-solid fa-sort-down iconHidden"
                      }
                    ></i>
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
