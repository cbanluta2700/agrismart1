"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import CustomSelect from "./CustomSelect";
import CategoryDropdown from "./CategoryDropdown";
import GenderDropdown from "./GenderDropdown";
import SizeDropdown from "./SizeDropdown";
import ColorsDropdwon from "./ColorsDropdwon";
import PriceDropdown from "./PriceDropdown";
import shopData from "../Shop/shopData";
import SingleGridItem from "../Shop/SingleGridItem";
import SingleListItem from "../Shop/SingleListItem";

// Adapt imported component to use Saasfly design system
import { Button } from "@saasfly/ui/button";
import { Input } from "@saasfly/ui/input";
import { Checkbox } from "@saasfly/ui/checkbox";
import { Label } from "@saasfly/ui/label";

const ShopWithSidebar = () => {
  const [productStyle, setProductStyle] = useState("grid");
  const [productSidebar, setProductSidebar] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);

  const handleStickyMenu = () => {
    if (window.scrollY >= 80) {
      setStickyMenu(true);
    } else {
      setStickyMenu(false);
    }
  };

  const options = [
    { label: "Latest Products", value: "0" },
    { label: "Best Selling", value: "1" },
    { label: "Old Products", value: "2" },
  ];

  // Agricultural categories instead of technology ones
  const categories = [
    {
      name: "Seeds & Plants",
      products: 48,
      isRefined: true,
    },
    {
      name: "Fertilizers",
      products: 32,
      isRefined: false,
    },
    {
      name: "Pesticides",
      products: 25,
      isRefined: false,
    },
    {
      name: "Farming Tools",
      products: 41,
      isRefined: false,
    },
    {
      name: "Irrigation",
      products: 37,
      isRefined: false,
    },
    {
      name: "Livestock",
      products: 29,
      isRefined: false,
    },
  ];

  const genders = [
    {
      name: "Organic",
      products: 25,
    },
    {
      name: "Non-Organic",
      products: 42,
    },
  ];

  useEffect(() => {
    window.addEventListener("scroll", handleStickyMenu);
    return () => {
      window.removeEventListener("scroll", handleStickyMenu);
    };
  }, []);

  return (
    <>
      <section>
        <div className="container">
          <div className="grid grid-cols-12 gap-8">
            {/* <!-- Sidebar Start --> */}
            <div
              className={`${
                productSidebar ? "visible opacity-100" : "invisible opacity-0 lg:visible lg:opacity-100"
              } sidebar-wrapper fixed left-0 top-0 bg-white p-5 z-50 lg:static lg:p-0 w-[290px] lg:col-span-3 overflow-y-scroll h-[calc(100vh-90px)] lg:h-auto lg:overflow-y-auto border rounded p-4`}
            >
              <div className={`${!stickyMenu ? "lg:pt-0" : "lg:pt-5"}`}>
                <div className="lg:sticky lg:top-[100px]">
                  {/* <!-- Close Button Start --> */}
                  <Button
                    onClick={() => setProductSidebar(false)}
                    className="lg:hidden mb-5 p-2 flex items-center justify-center border rounded bg-gray-50"
                  >
                    Close Sidebar
                  </Button>
                  {/* <!-- Close Button End --> */}

                  {/* <!-- Search Box Start --> */}
                  <div className="search-box mb-5">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Search products…"
                        className="w-full h-10 pr-[42px] focus:outline-none focus:border-blue rounded shadow-[0px_3px_7px_rgba(0,0,0,0.15)]"
                      />
                      <button className="absolute top-0 right-0 flex items-center justify-center w-10 h-10 text-white bg-blue rounded-tr rounded-br">
                        <span className="text-white">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              className="stroke-current"
                              d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z"
                              strokeOpacity="0.95"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              className="stroke-current"
                              d="M17.4998 17.5L13.8748 13.875"
                              strokeOpacity="0.95"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </button>
                    </div>
                  </div>
                  {/* <!-- Search Box End --> */}

                  {/* <!-- Category Start --> */}
                  <CategoryDropdown categories={categories} />
                  {/* <!-- Category End --> */}

                  {/* <!-- Type Start --> */}
                  <GenderDropdown genders={genders} />
                  {/* <!-- Type End --> */}

                  {/* <!-- Price Start --> */}
                  <PriceDropdown />
                  {/* <!-- Price End --> */}

                  {/* <!-- Sizes Start --> */}
                  <SizeDropdown />
                  {/* <!-- Sizes End --> */}

                  {/* <!-- Color Start --> */}
                  <ColorsDropdwon />
                  {/* <!-- Color End --> */}
                </div>
              </div>
            </div>
            {/* <!-- Sidebar End --> */}

            {/* <!-- Content Start --> */}
            <div className="col-span-12 lg:col-span-9">
              {/* <!-- Breadcrumb Start --> */}
              <Breadcrumb
                title="Marketplace"
                pages={["Home", "Marketplace"]}
              />
              {/* <!-- Breadcrumb End --> */}

              {/* <!-- Heading/Filter Buttons Start --> */}
              <div className="flex flex-wrap items-center justify-between py-[26px] gap-4">
                <div className="flex items-center gap-[15px]">
                  <button
                    aria-label="button for product grid"
                    type="button"
                    onClick={() => setProductStyle("grid")}
                    className={`${
                      productStyle === "grid" ? "text-white bg-blue" : "bg-[#F6F6F6]"
                    } flex items-center justify-center w-9 h-10 rounded-[4px] duration-200`}
                  >
                    <svg
                      className="fill-current"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M8.33334 5.83366H5.83334C5.39167 5.83366 5 5.44199 5 5.00033V2.50033C5 2.05866 5.39167 1.66699 5.83334 1.66699H8.33334C8.775 1.66699 9.16667 2.05866 9.16667 2.50033V5.00033C9.16667 5.44199 8.775 5.83366 8.33334 5.83366Z" />
                      <path d="M14.1667 5.83366H11.6667C11.225 5.83366 10.8333 5.44199 10.8333 5.00033V2.50033C10.8333 2.05866 11.225 1.66699 11.6667 1.66699H14.1667C14.6083 1.66699 15 2.05866 15 2.50033V5.00033C15 5.44199 14.6083 5.83366 14.1667 5.83366Z" />
                      <path d="M8.33334 11.667H5.83334C5.39167 11.667 5 11.2753 5 10.8337V8.33366C5 7.89199 5.39167 7.50033 5.83334 7.50033H8.33334C8.775 7.50033 9.16667 7.89199 9.16667 8.33366V10.8337C9.16667 11.2753 8.775 11.667 8.33334 11.667Z" />
                      <path d="M14.1667 11.667H11.6667C11.225 11.667 10.8333 11.2753 10.8333 10.8337V8.33366C10.8333 7.89199 11.225 7.50033 11.6667 7.50033H14.1667C14.6083 7.50033 15 7.89199 15 8.33366V10.8337C15 11.2753 14.6083 11.667 14.1667 11.667Z" />
                      <path d="M8.33334 17.5H5.83334C5.39167 17.5 5 17.1083 5 16.6667V14.1667C5 13.725 5.39167 13.3333 5.83334 13.3333H8.33334C8.775 13.3333 9.16667 13.725 9.16667 14.1667V16.6667C9.16667 17.1083 8.775 17.5 8.33334 17.5Z" />
                      <path d="M14.1667 17.5H11.6667C11.225 17.5 10.8333 17.1083 10.8333 16.6667V14.1667C10.8333 13.725 11.225 13.3333 11.6667 13.3333H14.1667C14.6083 13.3333 15 13.725 15 14.1667V16.6667C15 17.1083 14.6083 17.5 14.1667 17.5Z" />
                    </svg>
                  </button>
                  <button
                    aria-label="button for product list"
                    type="button"
                    onClick={() => setProductStyle("list")}
                    className={`${
                      productStyle === "list" ? "text-white bg-blue" : "bg-[#F6F6F6]"
                    } flex items-center justify-center w-9 h-10 rounded-[4px] duration-200`}
                  >
                    <svg
                      className="fill-current"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M7.5 5H15.8333C16.2751 5 16.6667 4.6083 16.6667 4.16667C16.6667 3.725 16.2751 3.33333 15.8333 3.33333H7.5C7.05833 3.33333 6.66666 3.725 6.66666 4.16667C6.66666 4.6083 7.05833 5 7.5 5Z" />
                      <path d="M15.8333 9.16699H7.5C7.05833 9.16699 6.66666 8.77533 6.66666 8.33366C6.66666 7.89199 7.05833 7.50033 7.5 7.50033H15.8333C16.2751 7.50033 16.6667 7.89199 16.6667 8.33366C16.6667 8.77533 16.2751 9.16699 15.8333 9.16699Z" />
                      <path d="M15.8333 13.333H7.5C7.05833 13.333 6.66666 12.9413 6.66666 12.4997C6.66666 12.058 7.05833 11.6663 7.5 11.6663H15.8333C16.2751 11.6663 16.6667 12.058 16.6667 12.4997C16.6667 12.9413 16.2751 13.333 15.8333 13.333Z" />
                      <path d="M15.8333 17.5H7.5C7.05833 17.5 6.66666 17.1083 6.66666 16.6667C6.66666 16.225 7.05833 15.8333 7.5 15.8333H15.8333C16.2751 15.8333 16.6667 16.225 16.6667 16.6667C16.6667 17.1083 16.2751 17.5 15.8333 17.5Z" />
                      <path d="M4.16667 5.83366C4.99949 5.83366 5.70866 5.54283 5.70866 5.16699C5.70866 4.79116 4.99949 4.50033 4.16667 4.50033H3.33334C2.89167 4.50033 2.5 4.79116 2.5 5.16699C2.5 5.54283 2.89167 5.83366 3.33334 5.83366H4.16667Z" />
                      <path d="M4.16667 9.16699C4.99949 9.16699 5.70866 8.77533 5.70866 8.33366C5.70866 7.89199 4.99949 7.50033 4.16667 7.50033H3.33334C2.89167 7.50033 2.5 7.89199 2.5 8.33366C2.5 8.77533 2.89167 9.16699 3.33334 9.16699H4.16667Z" />
                      <path d="M4.16667 13.333C4.99949 13.333 5.70866 12.9413 5.70866 12.4997C5.70866 12.058 4.99949 11.6663 4.16667 11.6663H3.33334C2.89167 11.6663 2.5 12.058 2.5 12.4997C2.5 12.9413 2.89167 13.333 3.33334 13.333H4.16667Z" />
                      <path d="M4.16667 17.5C4.99949 17.5 5.70866 17.1083 5.70866 16.6667C5.70866 16.225 4.99949 15.8333 4.16667 15.8333H3.33334C2.89167 15.8333 2.5 16.225 2.5 16.6667C2.5 17.1083 2.89167 17.5 3.33334 17.5H4.16667Z" />
                    </svg>
                  </button>

                  <button
                    onClick={() => setProductSidebar(!productSidebar)}
                    className="flex lg:hidden items-center gap-[5px] text-white py-2 px-3 rounded bg-blue"
                  >
                    <svg
                      className="fill-current"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M10.7903 15.8337C10.4153 15.8337 10.1237 15.542 10.1237 15.167C10.1237 14.792 10.4153 14.5003 10.7903 14.5003H17.457C17.832 14.5003 18.1237 14.792 18.1237 15.167C18.1237 15.542 17.832 15.8337 17.457 15.8337H10.7903Z" />
                      <path d="M2.54199 15.8337C2.16699 15.8337 1.87533 15.542 1.87533 15.167C1.87533 14.7912 2.16699 14.4997 2.54199 14.4997H6.37533C6.75033 14.4997 7.04199 14.7912 7.04199 15.167C7.04199 15.542 6.75033 15.8337 6.37533 15.8337H2.54199Z" />
                      <path d="M8.33333 15.8337C7.95833 15.8337 7.66666 15.542 7.66666 15.167C7.66666 14.7912 7.95833 14.4997 8.33333 14.4997H9.16667C9.54167 14.4997 9.83333 14.7912 9.83333 15.167C9.83333 15.542 9.54167 15.8337 9.16667 15.8337H8.33333Z" />
                      <path d="M2.54199 10.8337C2.16699 10.8337 1.87533 10.542 1.87533 10.167C1.87533 9.79134 2.16699 9.49967 2.54199 9.49967H9.20866C9.58366 9.49967 9.87533 9.79134 9.87533 10.167C9.87533 10.542 9.58366 10.8337 9.20866 10.8337H2.54199Z" />
                      <path d="M13.625 10.833C13.25 10.833 12.9583 10.5413 12.9583 10.167C12.9583 9.79134 13.25 9.49967 13.625 9.49967H17.4583C17.8333 9.49967 18.125 9.79134 18.125 10.167C18.125 10.542 17.8333 10.833 17.4583 10.833H13.625Z" />
                      <path d="M10.7903 10.833C10.4153 10.833 10.1237 10.5413 10.1237 10.167C10.1237 9.79134 10.4153 9.49967 10.7903 9.49967H11.6237C11.9987 9.49967 12.2903 9.79134 12.2903 10.167C12.2903 10.542 11.9987 10.833 11.6237 10.833H10.7903Z" />
                      <path d="M5.37533 5.83366C4.99949 5.83366 4.70866 5.54283 4.70866 5.16699C4.70866 4.79116 4.99949 4.50033 5.37533 4.50033H17.457C17.8337 4.50033 18.1237 4.79116 18.1237 5.16699C18.1237 5.54283 17.8337 5.83366 17.457 5.83366H5.37533Z" />
                      <path d="M2.54199 5.83366C2.16699 5.83366 1.87533 5.54283 1.87533 5.16699C1.87533 4.79116 2.16699 4.50033 2.54199 4.50033H3.37533C3.75033 4.50033 4.04199 4.79116 4.04199 5.16699C4.04199 5.54283 3.75033 5.83366 3.37533 5.83366H2.54199Z" />
                    </svg>
                    <span>Filter</span>
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="font-medium text-custom-md">Sort by:</span>
                    <CustomSelect options={options} />
                  </div>
                  <div className="flex items-center gap-[13px]">
                    <div className="flex items-center gap-[7px]">
                      <Checkbox id="showPerPage" />
                      <Label htmlFor="showPerPage">Show</Label>
                    </div>
                    <div className="flex-none select-sort relative z-30">
                      <span className="inline-block bg-white border border-gray-4 rounded-[3px] min-w-12 h-10 text-center font-medium text-body leading-[39px] cursor-pointer">
                        8
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* <!-- Heading/Filter Buttons End --> */}

              {/* <!-- Products Start --> */}
              {productStyle === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-5">
                  {shopData.map((product, key) => (
                    <SingleGridItem key={key} item={product} />
                  ))}
                </div>
              )}

              {productStyle === "list" && (
                <div className="flex flex-col gap-10">
                  {shopData.map((product, key) => (
                    <SingleListItem key={key} item={product} />
                  ))}
                </div>
              )}
              {/* <!-- Products End --> */}

              {/* <!-- Products Pagination Start --> */}
              <div className="flex items-center justify-center border-t border-gray pt-7 mt-10">
                <div className="flex items-center gap-[5px]">
                  <ul className="flex items-center gap-[5px]">
                    <li>
                      <button
                        id="paginationLeft"
                        aria-label="button for pagination left"
                        type="button"
                        className="flex items-center justify-center w-8 h-9 ease-out duration-200 rounded-[3px] hover:text-white hover:bg-blue disabled:text-gray-4"
                      >
                        <svg
                          className="fill-current"
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12.1777 1.88445C12.3466 1.88445 12.4872 1.9407 12.6277 2.05319C12.8808 2.3063 12.8808 2.70005 12.6277 2.95319L6.72145 9.00007L12.6277 15.0188C12.8808 15.2719 12.8808 15.6657 12.6277 15.9188C12.3745 16.1719 11.9808 16.1719 11.7277 15.9188L5.37145 9.45007C5.11834 9.19694 5.11834 8.8032 5.37145 8.55007L11.7277 2.08132C11.8402 1.96882 12.0089 1.88445 12.1777 1.88445Z"
                            fill=""
                          />
                        </svg>
                      </button>
                    </li>
                    <li>
                      <Button
                        id="page-01"
                        aria-label="button for page 01"
                        type="button"
                        className="flex items-center justify-center w-8 h-9 text-white bg-blue rounded-[3px] disabled:text-gray-4"
                      >
                        01
                      </Button>
                    </li>
                    <li>
                      <Button
                        id="page-02"
                        aria-label="button for page 02"
                        type="button"
                        className="flex items-center justify-center w-8 h-9 ease-out duration-200 rounded-[3px] hover:text-white hover:bg-blue disabled:text-gray-4"
                      >
                        02
                      </Button>
                    </li>
                    <li>
                      <Button
                        id="page-03"
                        aria-label="button for page 03"
                        type="button"
                        className="flex items-center justify-center w-8 h-9 ease-out duration-200 rounded-[3px] hover:text-white hover:bg-blue disabled:text-gray-4"
                      >
                        03
                      </Button>
                    </li>
                    <li>
                      <Button
                        id="page-dot"
                        aria-label="button for page dot"
                        type="button"
                        className="flex items-center justify-center w-8 h-9 ease-out duration-200 rounded-[3px] hover:text-white hover:bg-blue disabled:text-gray-4 font-thin text-gray-2"
                      >
                        ...
                      </Button>
                    </li>
                    <li>
                      <Button
                        id="page-09"
                        aria-label="button for page 09"
                        type="button"
                        className="flex items-center justify-center w-8 h-9 ease-out duration-200 rounded-[3px] hover:text-white hover:bg-blue disabled:text-gray-4"
                      >
                        09
                      </Button>
                    </li>
                    <li>
                      <Button
                        id="paginationRight"
                        aria-label="button for pagination right"
                        type="button"
                        className="flex items-center justify-center w-8 h-9 ease-out duration-200 rounded-[3px] hover:text-white hover:bg-blue disabled:text-gray-4"
                      >
                        <svg
                          className="fill-current"
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M5.82197 16.1156C5.65322 16.1156 5.5126 16.0594 5.37197 15.9469C5.11885 15.6937 5.11885 15.3 5.37197 15.0469L11.2782 9.00007L5.37197 2.98125C5.11885 2.72812 5.11885 2.33437 5.37197 2.08125C5.6251 1.82812 6.01885 1.82812 6.27197 2.08125L12.6282 8.55C12.8813 8.80312 12.8813 9.19687 12.6282 9.45L6.27197 15.9187C6.15947 16.0312 5.99072 16.1156 5.82197 16.1156Z"
                            fill=""
                          />
                        </svg>
                      </Button>
                    </li>
                  </ul>
                </div>
              </div>
              {/* <!-- Products Pagination End --> */}
            </div>
            {/* // <!-- Content End --> */}
          </div>
        </div>
      </section>
    </>
  );
};

export default ShopWithSidebar;
