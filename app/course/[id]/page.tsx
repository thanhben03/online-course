import { redirect } from "next/navigation"

export default function CoursePage({ params }: { params: { id: string } }) {
  // Redirect to learn page for course details
  redirect(`/learn/${params.id}`)
}
