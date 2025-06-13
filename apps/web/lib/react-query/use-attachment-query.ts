import { deleteAttachment, getAttachments } from "@/actions/attachment";
import { Attachment } from "@repo/db";
import { useMutation, useQuery } from "@tanstack/react-query";

const useAttachmentQuery = () => {
  const getAttachmentsQuery = useQuery<Attachment[]>({
    queryKey: ["attachments"],
    queryFn: async () => {
      return await getAttachments();
    },
    staleTime: 5 * 60 * 1000, //5min
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const deleteAttachmentMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deleteAttachment(id);
    },
    onSuccess: () => {
      getAttachmentsQuery.refetch();
    },
  });

  return {
    getAttachmentsQuery,
    deleteAttachmentMutation,
  };
};

export default useAttachmentQuery;
