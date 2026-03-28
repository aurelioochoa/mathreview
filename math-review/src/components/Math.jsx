import katex from 'katex'

export default function Math({ expr, display = false }) {
  const html = katex.renderToString(expr, {
    throwOnError: false,
    displayMode: display,
  })
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}
