import { buildTailwindCSS } from '../cssBuilder';

describe('cssBuilder', () => {
    it('should generate Tailwind CSS based on content', async () => {
        const content = '<div class="text-red-500">Test</div>';
        const css = await buildTailwindCSS(content);
        expect(css).toContain('.text-red-500');
    });
});