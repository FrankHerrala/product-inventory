import React, { useState } from "react";
import ItemList from "./ItemList.js";
import "./App.css";

function App() {
    const [view, setView] = useState(<div>Select a product</div>);
    const [manufacturerAvailability, setManufacturerAvailability] = useState(
        {}
    );

    return (
        <div className="App">
            <header>Product inventory</header>
            <div className="MainBody">
                <div className="Buttons">
                    <button
                        onClick={() =>
                            setView(
                                <ItemList
                                    productName="gloves"
                                    manufacturerAvailability={
                                        manufacturerAvailability
                                    }
                                    setManufacturerAvailability={(value) =>
                                        setManufacturerAvailability(value)
                                    }
                                />
                            )
                        }
                    >
                        Gloves
                    </button>
                    <button
                        onClick={() =>
                            setView(
                                <ItemList
                                    productName="beanies"
                                    manufacturerAvailability={
                                        manufacturerAvailability
                                    }
                                    setManufacturerAvailability={(value) =>
                                        setManufacturerAvailability(value)
                                    }
                                />
                            )
                        }
                    >
                        Beanies
                    </button>
                    <button
                        onClick={() =>
                            setView(
                                <ItemList
                                    productName="facemasks"
                                    manufacturerAvailability={
                                        manufacturerAvailability
                                    }
                                    setManufacturerAvailability={(value) =>
                                        setManufacturerAvailability(value)
                                    }
                                />
                            )
                        }
                    >
                        Facemasks
                    </button>
                </div>
                {view}
            </div>
            <footer className="Footer">
                <a href="https://https://github.com/FrankHerrala/product-inventory">
                    Github
                </a>
            </footer>
        </div>
    );
}

export default App;
