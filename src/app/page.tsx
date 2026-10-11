export default function HomePage() {
  return (
    <div dangerouslySetInnerHTML={{
      __html: `<script>window.location.href="/preview.html"</script>`
    }} />
  )
}
