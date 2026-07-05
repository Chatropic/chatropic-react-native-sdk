describe("chatropic environment config", () => {
  afterEach(() => {
    jest.resetModules();
    jest.dontMock("../src/config/generated");
  });

  it("throws when the selected environment has no generated URL", async () => {
    jest.doMock("../src/config/generated", () => ({
      CHATROPIC_GENERATED_DEVELOPMENT_AGENT_URL: "",
      CHATROPIC_GENERATED_PRODUCTION_AGENT_URL: "",
    }));

    const { getDefaultAgentUrl } = await import("../src/config/environment");

    expect(() => getDefaultAgentUrl("production")).toThrow(
      "Chatropic production agent URL is not configured",
    );
    expect(() => getDefaultAgentUrl("development")).toThrow(
      "Chatropic development agent URL is not configured",
    );
  });

  it("returns the generated URL for the selected environment", async () => {
    jest.doMock("../src/config/generated", () => ({
      CHATROPIC_GENERATED_DEVELOPMENT_AGENT_URL: "https://dev-api.example.com/",
      CHATROPIC_GENERATED_PRODUCTION_AGENT_URL: "https://app.chatropic.com/",
    }));

    const { getDefaultAgentUrl } = await import("../src/config/environment");

    expect(getDefaultAgentUrl("development")).toBe("https://dev-api.example.com");
    expect(getDefaultAgentUrl("production")).toBe("https://app.chatropic.com");
  });
});
