// from https://codesandbox.io/s/tabulator-crud-working-i0dos?file=/src/TabulatorGrid1.js:0-9487
import React, { useEffect, useState } from "react";

//import Tabulator from "tabulator-tables"; //import Tabulator library
//import "tabulator-tables/dist/css/tabulator.min.css"; //import Tabulator stylesheet

import "react-tabulator/css/tabulator.min.css";
import { ReactTabulator } from "react-tabulator";
//import "font-awesome/css/font-awesome.min.css";

// import AddCircleIcon from "@material-ui/icons/AddCircle";
// import SaveIcon from "@material-ui/icons/Save";

import { Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1)
  }
}));

function TabulatorGrid1() {
  const classes = useStyles();
  const tableRef = React.createRef();
  const [columnsList, setColumnsList] = useState(null);

  const [productList, setProductList] = useState(null);
  const [productListInitial, setProductListInitial] = useState(null);
  const [finalProductList, setFinalProductList] = useState(null);

  const [displayRecord, setDisplayRecord] = useState(0); //Display this record

  const [isBusy, setIsBusy] = useState(true);
  const [isSaved, setIsSaved] = useState(true); //Display save message

  const [rowCount, setRowCount] = useState(0); //Forces refresh on grid
  const [recCounter, setRecCounter] = useState(-1); //New id for new records

  var viewIcon = function (cell, formatterParams, onRendered) {
    //plain text value
    return "<i class='fa fa-eye fa-lg'></i> View";
  };

  var deleteIcon = function (cell, formatterParams, onRendered) {
    //plain text value
    return "<i class='fa fa-trash fa-lg'></i> Delete";
  };

  const columns = [
    { title: "ID", field: "id", width: 50, sorter: "number" },
    {
      title: "View",
      field: "passed",
      align: "center",
      formatter: viewIcon,
      cellClick: function (e, cell) {
        console.log("view=>" + cell.getRow().getData().id);
        setDisplayRecord(cell.getRow().getData().id);
      }
    },
    { title: "Product", field: "product", hozAlign: "center", editor: true },
    { title: "Price", field: "price", hozAlign: "left" },
    { title: "Quantity", field: "quantity" },
    {
      title: "Availability",
      field: "availability",
      editor: "select",
      editorParams: { values: ["Enable", "Disable"] }
    },
    {
      title: "Delete",
      field: "passed",
      align: "center",
      formatter: deleteIcon,
      cellClick: function (e, cell) {
        console.log("delete=>" + cell.getRow().getData().id);
        cell.getRow().delete();
      }
    }
  ];

  var list1 = [
    {
      id: 1,
      price: 2,
      quantity: 6,
      product: "Apples",
      availability: "Enable"
    },
    {
      id: 2,
      price: 2,
      quantity: 2,
      product: "Oranges",
      availability: "Enable"
    },
    {
      id: 3,
      price: 1,
      quantity: 2,
      product: "Bananas",
      availability: "Enable"
    },
    {
      id: 4,
      price: 5,
      quantity: 1,
      product: "Strawberry",
      availability: "Disable"
    }
  ];

  useEffect(() => {
    setProductList(list1);
    setProductListInitial(JSON.parse(JSON.stringify(list1))); //Deep copy
    setColumnsList(columns);

    if (null != list1) {
      setRowCount(list1.length);
    }
    /*
      new Tabulator(refTable, {
        layout:"fitDataStretch",
        data: list1,
        reactiveData: true,
        columns: columns
      });
*/
    setIsBusy(false);
  }, []);

  const saveAll = () => {
    //console.log("Save All ==>"+JSON.stringify(productList));

    //Step 1 - Convert array of objects to array of strings
    let newList = [];
    if (null != productList) {
      for (let i = 0; i < productList.length; i++) {
        newList.push(JSON.stringify(productList[i]));
      }
    }

    //Step 2 - Convert array of objects to array of strings
    let oldList = [];
    if (null != productListInitial) {
      for (let i = 0; i < productListInitial.length; i++) {
        oldList.push(JSON.stringify(productListInitial[i]));
      }
    }
    //console.log("newList ==>"+JSON.stringify(newList));
    //console.log("oldList ==>"+JSON.stringify(oldList));

    //Step 3 - Items to add/modify/delete
    let insertList = newList.filter((x) => !oldList.includes(x));
    let deleteList = oldList.filter((x) => !newList.includes(x));
    let modifyObjects = [];

    //console.log("difference1 (Insert/Modify) ==>"+JSON.stringify(insertList));
    //console.log("difference2 (Remove/Modify) ==>"+JSON.stringify(deleteList));

    //Step 4 - Bring objects back for further  process
    let insertObjects = [];
    let deleteObjects = [];

    if (null != insertList) {
      for (let i = 0; i < insertList.length; i++) {
        insertObjects.push(JSON.parse(insertList[i]));
      }
    }

    if (null != deleteList) {
      for (let i = 0; i < deleteList.length; i++) {
        deleteObjects.push(JSON.parse(deleteList[i]));
      }
    }

    //Step 5 - find intersection of IDs
    let insertArray = [];
    let deleteArray = [];

    insertObjects.forEach((item) => {
      insertArray.push(item.id);
    });
    deleteObjects.forEach((item) => {
      deleteArray.push(item.id);
    });

    insertObjects.forEach(function (obj) {
      console.log("insert=>" + obj.id);
    });

    //console.log("insertArray=>"+insertArray.toString());
    //console.log("deleteArray=>"+deleteArray.toString());

    let intersectionArray = [];
    intersectionArray = insertArray.filter((value) =>
      deleteArray.includes(value)
    );
    //console.log("intersectionArray=>"+intersectionArray.toString());

    //Step 6 - For intersection ids,
    // a) remove id from insert list,
    // b) remove from delete list and add to modify list.
    if (
      typeof intersectionArray !== "undefined" &&
      intersectionArray.length > 0
    ) {
      let modifyObjectsNew = [];
      //a) remove id from insert list,
      let insertObjectsNew = [];
      if (null != insertObjects) {
        for (let i = 0; i < insertObjects.length; i++) {
          if (!intersectionArray.includes(insertObjects[i].id)) {
            insertObjectsNew.push(insertObjects[i]);
            //console.log("inserting==>"+insertObjects[i]);
          } else {
            modifyObjectsNew.push(insertObjects[i]);
          }
        }

        insertObjects = JSON.parse(JSON.stringify(insertObjectsNew));
      }

      // b) remove from delete list and add to modify list.
      let deleteObjectsNew = [];

      if (null != deleteObjects) {
        for (let i = 0; i < deleteObjects.length; i++) {
          if (!intersectionArray.includes(deleteObjects[i].id)) {
            deleteObjectsNew.push(deleteObjects[i]);
          } //else {
          //modifyObjectsNew.push(deleteObjects[i]);
          //}
        }

        deleteObjects = JSON.parse(JSON.stringify(deleteObjectsNew));
        modifyObjects = JSON.parse(JSON.stringify(modifyObjectsNew));
      }
    } //end of if condition

    const finalList = {
      INSERT: insertObjects,
      MODIFY: modifyObjects,
      DELETE: deleteObjects
    };
    console.log("final list:" + JSON.stringify(finalList));
    setFinalProductList(finalList);

    console.log("=====================");
    setIsSaved(true);
  };

  //Add new record
  function addNewRow() {
    console.log("Add new row");
    var rec1 = {
      id: recCounter,
      price: 1,
      quantity: 2,
      product: "Fruit " + recCounter,
      availability: "Disable"
    };
    productList.push(rec1);
    setProductList(productList);
    setRowCount(productList.length);
    setRecCounter(recCounter - 1);
    console.log("After adding row=>" + JSON.stringify(productList));

    var tabulator = tableRef.current.table;
    tabulator.addRow(rec1);
  }

  {
    /* 
      <div className="foo" ref={el => (refTable = el)} />
*/
  }

  return (
    <div align="left">
      {isBusy ? (
        <div> Loading </div>
      ) : (
        <div>
          <ReactTabulator
            ref={tableRef}
            layout="fitDataStretch"
            data={productList}
            reactiveData={true}
            columns={columnsList}
            dataChanged={(newData) => {
              console.log("dataEdited:", newData);
              setProductList(newData);
            }}
          />
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={addNewRow}
            className={classes.button}
            
            
          >
            Add Product
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={saveAll}
            className={classes.button}
            
          >
            Save
          </Button>
          {!isSaved && "Unsaved Changes"}
          <br />
          Display Product Details: {displayRecord}
          <br />
          Final Product List:
          {finalProductList === null ? (
            <div> Nothing to save </div>
          ) : (
            <div>
              Insert: {JSON.stringify(finalProductList.INSERT)}
              <br /> Modify: {JSON.stringify(finalProductList.MODIFY)}
              <br /> Delete: {JSON.stringify(finalProductList.DELETE)}
            </div>
          )}
          <br />
          Note: Send this to Services/DB to store
        </div>
      )}
    </div>
  );
}

export default TabulatorGrid1;
