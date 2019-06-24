import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import "../css/main.css";
import "../App.css";
import axios from "axios";
import BrowserRouter from "react-router-dom";
import queryString from "query-string";
import MenuItem from "@material-ui/core/MenuItem";
import Input from "@material-ui/core/Input";
import { Alert } from "react-bootstrap";
import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import NativeSelect from "@material-ui/core/NativeSelect";
import DropdownButton from "react-bootstrap/DropdownButton";
import Dropdown from "react-bootstrap/Dropdown";

function Product(props) {
  return (
    <div
      className="griditem"
      style={{
        justifyContent: "center",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <img class="imgitem" src={props.img} style={{ alignSelf: "center" }} />
      <div style={{ textAlign: "center" }}>
        <span style={{ display: "inline-block", fontSize: 20, color: "blue" }}>
          {props.title}
        </span>
        <br />
        <span style={{ fontSize: 22, display: "inline-block" }}>
          ${props.price}
        </span>
      </div>
      <div
        style={{
          marginBottom: "10px",
          marginTop: "10px",
          alignItems: "center",
          alignSelf: "center"
        }}
      >
        <form action="/addToCart" method="post" target="hiddenFrame">
          <Button variant="contained" color="primary" type="submit">
            Add to Cart
          </Button>
          <input type="hidden" name="productId" value={props._id} />
        </form>
      </div>
    </div>
  );
}

class Shop extends Component {
  constructor(props) {
    super(props);
    this.state = {
      category: "",
      loading: false,
      prods: [],
      currentPage: 1,
      previousPage: 0,
      hasPreviousPage: false,
      hasNextPage: false,
      lastPage: "",
      nextPage: 2,
      sort: 0
    };
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  componentDidUpdate() {
    //Always pay attention to what you read in the post! Read the full post. It was mentioned there to always check if this is the new url before calling set state. That will prevent the infinite loop.
    if (this.state.loading === true) return;
    let flag = 0;
    const values = queryString.parse(this.props.location.search);
    let sort = values.sort;
    let handle = values.page;
    let category = values.category;
    console.log(category);
    console.log("did update");
    if (typeof sort === "undefined") sort = 1;
    if (typeof handle === "undefined") handle = 1;

    if (sort !== this.state.sort) {
      flag = 1;
    }
    if (handle !== this.state.currentPage) {
      flag = 1;
    }

    if (flag === 0) {
      return;
    }
    //yeah
    axios
      .get(`/shop/?page=${handle}&sort=${sort}`) //request
      .then(({ data }) => {
        console.log("arrived");
        if (data.hasNextPage === false) {
          data.nextPage = 0;
        }
        this.setState({
          prods: data.prods,
          currentPage: handle,
          previousPage: data.previousPage,
          nextPage: data.nextPage,
          hasPreviousPage: data.hasPreviousPage,
          hasNextPage: data.hasNextPage,
          lastPage: data.lastPage,
          sort: sort
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  componentDidMount() {
    let sort = this.state.sort;
    const values = queryString.parse(this.props.location.search);
    let handle = values.page;
    let category = values.category;
    console.log(category);

    if (typeof handle == "undefined") handle = 1;
    axios
      .get(`/shop/?page=${handle}&sort=${sort}&category=${category}`) //request
      .then(({ data }) => {
        console.log("LOADED");
        this.setState({
          category: data.category,
          loading: false,
          prods: data.prods,
          currentPage: data.currentPage,
          previousPage: data.previousPage,
          nextPage: data.nextPage,
          hasPreviousPage: data.hasPreviousPage,
          hasNextPage: data.hasNextPage,
          lastPage: data.lastPage,
          sort: 0
        });
      })
      .catch(err => {
        console.log("error1");
        console.log(err);
      });
    this.setState({ loading: true });
    console.log("loading");
  }

  render() {
    let items = this.state.prods.map((product, index) => {
      return (
        <Product
          key={index}
          price={product.price}
          img={product.img}
          title={product.title}
          description={product.description}
          _id={product._id}
        />
      );
    });

    return (
      <div
        style={{
          width: 1400,
          height: 650,
          display: "flex",
          flexDirection: "row"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "absolute",
            alignSelf: "left",
            width: 200
          }}
        >
          <DropdownButton id="drop1" title={this.state.category}>
            <Dropdown.Item href="/shop/?category=laptops">
              Laptops
            </Dropdown.Item>
            <Dropdown.Item href="/shop/?category=mobiles">
              Mobile Phones
            </Dropdown.Item>
            <Dropdown.Item href="/shop/?category=headphones">
              Headphones
            </Dropdown.Item>
          </DropdownButton>
        </div>
        {this.state.loading === true && (
          <div
            style={{
              position: "absolute",
              left: "20%",
              width: 1000,
              height: 650
            }}
          >
            <img
              src="/images/glow.gif"
              style={{
                position: "absolute",
                width: "100%",
                height: "80%",
                alignSelf: "center"
              }}
            />
          </div>
        )}
        {this.state.loading === false && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              position: "absolute",
              left: "20%",
              height: 550,
              width: 1100
            }}
          >
            <div style={{ display: "flex", flexDirection: "row" }}>
              <a style={{ float: "left", padding: 10, fontWeight: "bold" }}>
                Sort by Price:
              </a>
              <a style={{ float: "left", padding: 10 }}>
                <NavLink
                  style={{ textDecoration: "none" }}
                  to={`/shop/?page=1&sort=1`}
                >
                  Low to High
                </NavLink>
              </a>
              <a style={{ float: "left", padding: 10 }}>
                <NavLink
                  style={{ textDecoration: "none" }}
                  to={`/shop/?page=1&sort=-1`}
                >
                  High to Low
                </NavLink>
              </a>
            </div>
            <div className="gridcontainer" style={{ paddingTop: 10 }}>
              {items}
            </div>

            <div
              className="pagination"
              style={{
                alignSelf: "center",
                position: "absolute",
                left: "auto",
                right: "auto",
                bottom: "5%",
                minWidth: "350px"
              }}
            >
              {this.state.hasPreviousPage && (
                <a
                  style={{
                    postion: "absolute",
                    left: "auto",
                    minWidth: "100px"
                  }}
                >
                  <NavLink
                    to={`/shop/?page=${this.state.previousPage}&sort=${
                      this.state.sort
                    }`}
                  >
                    Previous Page
                  </NavLink>
                </a>
              )}
              <a
                style={{ postion: "absolute", left: "auto", minWidth: "100px" }}
              >
                <NavLink
                  to={`/shop/?page=${this.state.currentPage}&sort=${
                    this.state.sort
                  }`}
                >
                  {this.state.currentPage}
                </NavLink>
              </a>
              {this.state.hasNextPage && (
                <a
                  style={{
                    postion: "absolute",
                    left: "auto",
                    minWidth: "100px"
                  }}
                >
                  <NavLink
                    to={`/shop/?page=${this.state.nextPage}&sort=${
                      this.state.sort
                    }`}
                  >
                    Next Page
                  </NavLink>
                </a>
              )}
            </div>
          </div>
        )}

        <iframe
          name="hiddenFrame"
          width="0"
          height="0"
          border="0"
          style={{ display: "none" }}
        />
      </div>
    );
  }
}

export default Shop;
