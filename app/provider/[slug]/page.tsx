import { notFound } from "next/navigation";
import { getProvider } from "../../services/providersService";

interface Props {
  params: { slug: string };
}

export default async function Provider({ params: { slug } }: Props) {
  const provider = await getProvider(slug);
  if (!provider) notFound();

  return <div>{provider.name}</div>;
}
