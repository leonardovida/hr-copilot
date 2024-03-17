import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "../ui/badge";
import { getRanking } from "@/app/api";
import { convertDateFormat, getScoreColor } from "@/app/utils";
import { Card, CardHeader } from "@/components/ui/card";

export function RankingDataTable(inputData: any) {
  var jobId: number = inputData.data.jobId;
  const [rankingData, setRankingData] = React.useState<CandidateRanked[]>([]);

  React.useEffect(() => {
    getCandidateRankingData(jobId).then((data) => {
      setRankingData(data);
    });
  }, [jobId]);

  return (
    <div className="w-full">
      {rankingData && rankingData.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Talent</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rankingData ? (
              rankingData.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell>
                    <Badge
                      className={`${getScoreColor(d.score)} h-12 w-12 font-medium text-sm justify-center`}
                    >
                      {(d.score * 100).toFixed(1) + "%"}
                    </Badge>
                  </TableCell>
                  <TableCell>{d.createdAt}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="font-medium"></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      ) : (
        <Card>
          <CardHeader className="items-center justify-center">
            <p>No scores has been found, please evaluate a candidate!</p>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}

function getCandidateRankingData(jobId: number): Promise<CandidateRanked[]> {
  // TODO: resolve the ts-ignore issue
  // @ts-ignore
  let response: CandidateRanked[] = getRanking(jobId)
    .then((result) => {
      let rank: CandidateRanked[] = [];
      // TODO: resolve the ts-ignore issue
      // @ts-ignore
      result.data.forEach((el) => {
        rank.push({
          id: el.id,
          talentId: el.pdf_id,
          jobId: el.job_description_id,
          name: el.name,
          url: el.s3_url,
          score: el.score,
          createdAt: convertDateFormat(el.created_date),
        });
      });

      return rank;
    })
    .catch((e) => {
      console.warn("Error for getting ranked scores");
      return [];
    });

  // TODO: resolve the ts-ignore issue
  // @ts-ignore
  return response;
}
