import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export async function buildTailwindCSS(content: string, tailwindConfig: Record<string, any> = {}): Promise<string> {
    const css = `@tailwind base; @tailwind components; @tailwind utilities;`;

    const result = await postcss([
        tailwindcss({
            content: [{ raw: content }],
            ...tailwindConfig
            // other configs can be inserrted here
        }),
        autoprefixer,
    ]).process(css, {
        from: undefined,
    });

    return result.css;
}