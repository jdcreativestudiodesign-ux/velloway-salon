import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PHOTOS } from "@/lib/photos";
import { SERVICES } from "@/lib/salon";
import Home from "./page";

describe("Home page", () => {
  it("says clearly that this is a demo for an invented business", () => {
    render(<Home />);
    expect(screen.getByText(/Portfolio sample: an invented business/)).toBeInTheDocument();
  });

  it("has one main heading and a heading for each section", () => {
    render(<Home />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 2, name: "The menu" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Book in a minute" })).toBeInTheDocument();
  });

  it("lists every service with its price", () => {
    render(<Home />);
    const list = screen.getByRole("list");
    for (const service of SERVICES) {
      const item = within(list).getByRole("heading", { name: service.name }).closest("li");
      expect(item).not.toBeNull();
      expect(within(item as HTMLElement).getByText(service.price)).toBeInTheDocument();
    }
  });

  it("links the calls to action to the booking form and the prices", () => {
    render(<Home />);
    expect(screen.getByRole("link", { name: "Book a visit" })).toHaveAttribute("href", "#book");
    expect(screen.getByRole("link", { name: "See prices" })).toHaveAttribute("href", "#services");
    expect(document.getElementById("book")).not.toBeNull();
    expect(document.getElementById("services")).not.toBeNull();
  });

  it("offers a skip link to the main content", () => {
    render(<Home />);
    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveAttribute("href", "#main");
    expect(screen.getByRole("main")).toHaveAttribute("id", "main");
  });

  it("shows the hero photo with a real description", () => {
    render(<Home />);
    expect(screen.getByRole("img", { name: PHOTOS["salon-hero"].alt })).toBeInTheDocument();
  });
});
