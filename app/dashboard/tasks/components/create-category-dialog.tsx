// "use client"

// import { useState } from "react"
// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { useToast } from "@/hooks/use-toast"
// import { Category } from "../columns"

// interface CreateCategoryDialogProps {
//   open: boolean
//   onOpenChange: (open: boolean) => void
//   onCreated: (category: Category) => void
// }

// export function CreateCategoryDialog({
//   open,
//   onOpenChange,
//   onCreated
// }: CreateCategoryDialogProps) {
//   const supabase = createClientComponentClient()
//   const { toast } = useToast()
//   const [name, setName] = useState("")
//   const [color, setColor] = useState("#000000")
//   const [loading, setLoading] = useState(false)

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setLoading(true)

//     try {
//       const { data: { user } } = await supabase.auth.getUser()
//       if (!user) throw new Error("No user found")

//       const { data: category, error } = await supabase
//         .from("categories")
//         .insert([{
//           name,
//           color,
//           user_id: user.id,
//         }])
//         .select()
//         .single()

//       if (error) throw error

//       toast({
//         title: "Success",
//         description: "Category created successfully",
//       })

//       onCreated(category)
//       onOpenChange(false)
//       setName("")
//       setColor("#000000")
//     } catch (error) {
//       console.error("Error:", error)
//       toast({
//         title: "Error",
//         description: error instanceof Error ? error.message : "Failed to create category",
//         variant: "destructive",
//       })
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Create New Category</DialogTitle>
//         </DialogHeader>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="grid gap-2">
//             <Label htmlFor="name">Name</Label>
//             <Input
//               id="name"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               placeholder="Category name"
//               required
//             />
//           </div>
//           <div className="grid gap-2">
//             <Label htmlFor="color">Color</Label>
//             <div className="flex gap-2">
//               <Input
//                 id="color"
//                 type="color"
//                 value={color}
//                 onChange={(e) => setColor(e.target.value)}
//                 className="w-[100px]"
//               />
//               <Input
//                 type="text"
//                 value={color}
//                 onChange={(e) => setColor(e.target.value)}
//                 placeholder="#000000"
//                 pattern="^#[0-9A-Fa-f]{6}$"
//               />
//             </div>
//           </div>
//           <Button type="submit" disabled={loading}>
//             {loading ? "Creating..." : "Create Category"}
//           </Button>
//         </form>
//       </DialogContent>
//     </Dialog>
//   )
// } 