import { Test, TestingModule } from "@nestjs/testing";
import { LinkPreviewController } from "./link-preview.controller";

describe("LinkPreviewController", () => {
    let controller: LinkPreviewController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [LinkPreviewController],
        }).compile();

        controller = module.get<LinkPreviewController>(LinkPreviewController);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });
});
