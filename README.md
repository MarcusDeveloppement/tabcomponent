# Wealth Health

This package is a Reactjs component that returns an array based on data.
The table can be sorted in ascending or descending order according to the selected category, filtered with the search bar, displayed the number of entries up to 100.

## Installation

Clone the repository:

```bash
npm install @marcusdeveloppement/tabcomponent@1.1.0

```

## Usage/Examples

```javascript
import TableComponent from "@marcusdeveloppement/tabcomponent";

const App = () => {
  const content = [
    {
      firstName: "John",
      lastName: "Doe",
      birthday: "1990-01-01",
      street: "123 Mainstreet avenue",
      city: "Anytown",
    },
    // You can add or remove other keys/values, or create another object
  ];

  return (
    <main>
      <TableComponent content={content} />
    </main>
  );
};
```

## Style information

For styling you can get the CSS from this [repository](https://github.com/MarcusDeveloppement/tabcomponent) and use the browser inspector to try out the colors you like!

## Screenshot exemple

![App Screenshot](https://i.imgur.com/2HsSLg5.png)
