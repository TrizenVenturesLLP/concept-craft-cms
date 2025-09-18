import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Star, Archive, TrendingUp, PieChart } from "lucide-react";

const stats = [
  {
    title: "Total Problem Statements",
    value: "247",
    change: "+12%",
    changeType: "positive" as const,
    icon: FileText,
  },
  {
    title: "Active Problems",
    value: "189",
    change: "+5%",
    changeType: "positive" as const,
    icon: TrendingUp,
  },
  {
    title: "Draft Problems",
    value: "34",
    change: "+8",
    changeType: "neutral" as const,
    icon: Archive,
  },
  {
    title: "Featured Problems",
    value: "23",
    change: "+3",
    changeType: "positive" as const,
    icon: Star,
  },
];

const recentActivity = [
  {
    id: "AIM001",
    title: "AI-Powered Student Assessment System",
    domain: "Artificial Intelligence",
    status: "published" as const,
    time: "2 hours ago",
  },
  {
    id: "WEB012",
    title: "E-commerce Platform with AR Integration",
    domain: "Web Development",
    status: "draft" as const,
    time: "4 hours ago",
  },
  {
    id: "IOT005",
    title: "Smart Campus Energy Management",
    domain: "IoT",
    status: "published" as const,
    time: "6 hours ago",
  },
];

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your problem statements.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className={`text-xs ${
                stat.changeType === "positive" 
                  ? "text-status-active" 
                  : "text-muted-foreground"
              }`}>
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest problem statement submissions and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.domain} • {item.id}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      item.status === "published" 
                        ? "bg-status-active/10 text-status-active" 
                        : "bg-status-draft/10 text-status-draft"
                    }`}>
                      {item.status}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <button className="flex items-center space-x-3 w-full p-3 text-left rounded-lg bg-accent/50 hover:bg-accent transition-colors">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Add New Problem</p>
                  <p className="text-xs text-muted-foreground">Create a new problem statement</p>
                </div>
              </button>
              <button className="flex items-center space-x-3 w-full p-3 text-left rounded-lg bg-accent/50 hover:bg-accent transition-colors">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Bulk Upload</p>
                  <p className="text-xs text-muted-foreground">Upload multiple problems via CSV</p>
                </div>
              </button>
              <button className="flex items-center space-x-3 w-full p-3 text-left rounded-lg bg-accent/50 hover:bg-accent transition-colors">
                <PieChart className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">View Analytics</p>
                  <p className="text-xs text-muted-foreground">Check usage statistics and trends</p>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}