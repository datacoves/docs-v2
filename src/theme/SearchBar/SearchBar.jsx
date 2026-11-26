/**
 * Swizzled from docusaurus-search-local 0.0.0 (MIT, Copyright (c) 2020 优维科技),
 * theme/SearchBar/SearchBar.jsx. The package hasn't been published since 2022.
 * Copied unchanged except for import paths, so that it renders the local
 * ./SearchButton (the plugin imports it relatively).
 */
import React, { useEffect, useState } from "react";
import { useLocation } from "@docusaurus/router";
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { SearchButton } from "./SearchButton";
import SearchModal from "@theme/SearchModal";
import { Mark } from "docusaurus-search-local/dist/client/client/utils/proxiedGenerated";
const SEARCH_PARAM_HIGHLIGHT = "_highlight";
function isEditingContent(event) {
    const element = event.target;
    const tagName = element.tagName;
    return (element.isContentEditable ||
        tagName === "INPUT" ||
        tagName === "SELECT" ||
        tagName === "TEXTAREA");
}
export default function SearchBar() {
    const location = useLocation();
    const { siteConfig: { baseUrl }, } = useDocusaurusContext();
    const [isOpen, setIsOpen] = useState(false);
    useEffect(() => {
        if (!Mark) {
            return;
        }
        const keywords = ExecutionEnvironment.canUseDOM
            ? new URLSearchParams(location.search).getAll(SEARCH_PARAM_HIGHLIGHT)
            : [];
        if (keywords.length === 0) {
            return;
        }
        const root = document.querySelector("article");
        if (!root) {
            return;
        }
        const mark = new Mark(root);
        mark.unmark();
        mark.mark(keywords);
    }, [location.search]);
    useEffect(() => {
        function onKeyDown(event) {
            if ((event.keyCode === 27 && isOpen) ||
                // The `Cmd+K` shortcut both opens and closes the modal.
                (event.key === "k" && (event.metaKey || event.ctrlKey)) ||
                // The `/` shortcut opens but doesn't close the modal because it's
                // a character.
                (!isEditingContent(event) && event.key === "/" && !isOpen)) {
                event.preventDefault();
                if (isOpen) {
                    setIsOpen(false);
                }
                else {
                    setIsOpen(true);
                }
            }
        }
        window.addEventListener("keydown", onKeyDown);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [isOpen]);
    return (<>
      <SearchButton onClick={() => {
            setIsOpen(true);
        }}/>

      {isOpen ? <SearchModal onClose={() => setIsOpen(false)}/> : ""}
    </>);
}
