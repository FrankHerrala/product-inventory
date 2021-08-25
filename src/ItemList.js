import React, { useState, useEffect } from "react";
import "./App.css";

const parser = new DOMParser();
const reducer = (accumulator, currentValue) =>
    Object.assign(accumulator, currentValue);

function ItemList(props) {
    const [itemList, setItemList] = useState(null);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        setLoadingMessage("Loading");
        fetch(
            "https://bad-api-assignment.reaktor.com/v2/products/" +
                props.productName
        )
            .then((response) => response.json())
            .then((result) => {
                getManufacturerAvailability(result).then((productInfo) => {
                    setLoadingMessage("");
                    setItemList(productInfo);
                });
            })
            .catch((error) => console.log("error", error));
    }, [props.productName]);

    async function getManufacturerAvailability(productList) {
        const uniqueManufacturers = [
            ...new Set(productList.map((item) => item.manufacturer)),
        ];
        //If there was a case that some items had different manufacturers,
        //this would check if those would need to be fetched.
        const unfetchedManufacturers = uniqueManufacturers.filter(
            (item) =>
                !Object.keys(props.manufacturerAvailability).includes(item)
        );
        if (unfetchedManufacturers.length === 0) {
            const manufacturerAvailability = props.manufacturerAvailability;
            const productInfo = listProductInformation(
                productList,
                manufacturerAvailability
            );
            return productInfo;
        } else {
            const manufacturerAvailabilities = await fetchManufacturerData(
                unfetchedManufacturers
            );
            const allProductInfo = await Promise.all(
                manufacturerAvailabilities
            ).then((manufacturerData) => {
                const manufacturerAvailability =
                    manufacturerData.reduce(reducer);
                props.setManufacturerAvailability({
                    ...manufacturerAvailability,
                    ...props.manufacturerAvailability,
                });
                const productInfo = listProductInformation(
                    productList,
                    manufacturerAvailability
                );
                return productInfo;
            });
            return allProductInfo;
        }
    }

    function listProductInformation(productList, manufacturerAvailability) {
        const productInfo = productList.map((product) => {
            let itemAvailability = "";
            try {
                itemAvailability = manufacturerAvailability[
                    product.manufacturer
                ].find((elem) => elem.id.toLowerCase() === product.id);
                itemAvailability = parseXML(itemAvailability.DATAPAYLOAD);
            } catch {
                itemAvailability = "error";
            }

            return {
                id: product.id,
                name: product.name,
                price: product.price,
                availability: itemAvailability,
                manufacturer: product.manufacturer,
            };
        });

        return productInfo;
    }

    function parseXML(xmlString) {
        var xmlData = parser.parseFromString(xmlString, "text/xml");
        return xmlData.getElementsByTagName("INSTOCKVALUE")[0].childNodes[0]
            .nodeValue;
    }

    async function fetchManufacturerData(manufacturers) {
        const manufacturerData = await manufacturers.map(async (elem) => {
            var response = await fetch(
                "https://bad-api-assignment.reaktor.com/v2/availability/" + elem
            );
            var data = await response.json();
            if (data.response === "[]") {
                setLoadingMessage(
                    "Error fetching manufacturer data. Refetching"
                );
                //Set 5 as arbitrary times for retrying fetch.
                for (let i = 0; i < 5 && data.response === "[]"; i++) {
                    response = await fetch(
                        "https://bad-api-assignment.reaktor.com/v2/availability/" +
                            elem
                    );
                    data = await response.json();
                }
                if (data.response === "[]") {
                    setErrorMessage(
                        "Refetch failed after 5 tries reload page."
                    );
                }
            }
            return { [elem]: data.response };
        });

        return manufacturerData;
    }

    return (
        <div>
            {errorMessage === "" &&
            itemList !== null &&
            loadingMessage === "" ? (
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Availability</th>
                            <th>Manufacturer</th>
                        </tr>
                    </thead>
                    <tbody>
                        {itemList.map((elem) => (
                            <tr key={elem.id}>
                                <td>{elem.name}</td>
                                <td>{elem.price}</td>
                                <td>{elem.availability}</td>
                                <td>{elem.manufacturer}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : errorMessage === "" ? (
                <div className="MessageContainer">
                    <p className="Loading">{loadingMessage}</p>
                    <div className="Dot0" />
                    <div className="Dot1" />
                    <div className="Dot2" />
                </div>
            ) : (
                <p>{errorMessage}</p>
            )}
        </div>
    );
}

export default ItemList;
