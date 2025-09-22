import { AppShell } from "@/components/layout/AppSidebar";
import Header from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

export default function NotificationsPage() {
  const [driver, setDriver] = useState("All");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!title.trim() || !message.trim()) {
      toast({ title: "Missing fields", description: "Title and Message are required." });
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    toast({ title: "Notification queued", description: `To: ${driver}` });
    setTitle("");
    setMessage("");
  };

  return (
    <AppShell>
      <Header />
      <div className="px-4 pb-10 pt-4">
        <div className="mb-4 text-sm text-muted-foreground">Send a notification to drivers</div>
        <Card>
          <CardContent className="p-6">
            <div className="grid max-w-2xl gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Drivers</div>
                <Select value={driver} onValueChange={setDriver}>
                  <SelectTrigger className="mt-1 max-w-sm">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Irfan">Irfan</SelectItem>
                    <SelectItem value="Zafar">Zafar</SelectItem>
                    <SelectItem value="Reaza">Reaza</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Title</div>
                <Input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Title" className="mt-1 max-w-sm" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Message</div>
                <Textarea value={message} onChange={(e)=>setMessage(e.target.value)} placeholder="Message" className="mt-1 h-32" />
              </div>
              <div>
                <Button onClick={onSubmit} disabled={submitting} className="bg-sky-600 hover:bg-sky-500">
                  <Send className="mr-2 h-4 w-4" /> {submitting ? "Sending..." : "Send"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
